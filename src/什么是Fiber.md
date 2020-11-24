# Fiber是什么

react在v16版本实现了一种==异步可中断更新==机制，react将一次更新拆分成若干个任务单元，在更新的时候挨个完成，如果此时发现有优先级更高的任务单元时，立刻终止当前的任务执行，这种机制由React中的**Fiber Reconciler**提供

在react内部定义了类```FiberNode```，我的理解他就是虚拟dom，看一下```FiberNode```的定义
```javascript

    function FiberNode(tag, pendingProps, key, mode) {
        // Instance
        this.tag = tag;
        this.key = key;
        this.elementType = null;
        this.type = null;
        this.stateNode = null; // Fiber

        this.return = null;
        this.child = null;
        this.sibling = null;
        this.index = 0;
        this.ref = null;
        this.pendingProps = pendingProps;
        this.memoizedProps = null;
        this.updateQueue = null;
        this.memoizedState = null;
        this.dependencies = null;
        this.mode = mode; // Effects

        this.flags = NoFlags;
        this.nextEffect = null;
        this.firstEffect = null;
        this.lastEffect = null;
        this.lanes = NoLanes;
        this.childLanes = NoLanes;
        this.alternate = null;
        
        // 省略

```
可以看```FiberNode```有很多我们熟知的属性比如```key```，```ref```等，这里有几个指的注意的属性```alternate```, ```stateNode```，```child```，```sibling```，```return```,我们知道Fiber树是一个树形结构，其实这几个属性指针

- child指向子fiber节点
- sibling指向兄弟fiber节点
- return指向父级fiber节点

```alternate```, ```stateNode```比较特别，```stateNode```只有rootFiber中有值的，rootFiber也就是Fiber树的根节点，比如我们最常见的react的demo中的```<App />```，这个组件的虚拟dom属性```stateNode```有值，那么这个指针指向的是谁呢？指其实向的是一个```fiberRootNode```，是的没错，React中还定义了一个类叫```FiberRootNode```
```javascript
    function FiberRootNode(containerInfo, tag, hydrate) {
        this.tag = tag;
        this.containerInfo = containerInfo;
        this.pendingChildren = null;
        this.current = null;
        this.pingCache = null;
        this.finishedWork = null;
        this.timeoutHandle = noTimeout;
        this.context = null;
        this.pendingContext = null;
        this.hydrate = hydrate;
            
         // 省略
    }
```
在首次执行```ReactDOM.render```的时候，会根据```contianer```，创建出一个```FiberRootNode```的实例，这里也有一个属性值得关注```current```, ```fiberRootNode```创建完后，紧接着就会创建一个我们前面提到的```rootFiber```,而这个```current```则是指向```rootFiber```的,所以我们把```rootFiber```也称为```currentFiber```
```javascript
fiberRootNode ---current---> rootFiber
rootFiber ---stateNode---> fiberRootNode
```
那么```alternate```这个指向的是谁呢？
```
rootFiber ---alternate---> workInProgressFiber
```
这个```workInProgress```其实也是一个Fiber的实例，那么他是怎么来的呢，看源码中方法```createWorkInProgress```的实现
```javascript
 function createWorkInProgress(current, pendingProps) {
    var workInProgress = current.alternate;

    if (workInProgress === null) {
        // We use a double buffering pooling technique because we know that we'll
        // only ever need at most two versions of a tree. We pool the "other" unused
        // node that we're free to reuse. This is lazily created to avoid allocating
        // extra objects for things that are never updated. It also allow us to
        // reclaim the extra memory if needed.
        workInProgress = createFiber(current.tag, pendingProps, current.key, current.mode);
        workInProgress.elementType = current.elementType;
        workInProgress.type = current.type;
        workInProgress.stateNode = current.stateNode;

        {
            // DEV-only fields
            workInProgress._debugID = current._debugID;
            workInProgress._debugSource = current._debugSource;
            workInProgress._debugOwner = current._debugOwner;
            workInProgress._debugHookTypes = current._debugHookTypes;
        }

        workInProgress.alternate = current;
        current.alternate = workInProgress;
    } else {
        workInProgress.pendingProps = pendingProps; // Needed because Blocks store data on type.

        workInProgress.type = current.type; // We already have an alternate.
    }
 }
```
这里的第一个参数```current```，就是我们上面提到的```currentFiber```，然后从函数内部的代码可以看到,创建```workInProgress```时，实际上是创建了一个新的```Fiber```，然后把```currentFiber```上的值都赋值给了```workInProgress```,==也就是说其实workInProgress和current是两个值相同的对象并且互相通过alternate关联==
```
workInProgress ---alternate---> current
current ---alternate---> workInProgress
```

# Fiber树是如何构建的
前面讲了```Fiber```在```React```中的定义，以及```currentFiber```和```workInProgress```的创建，那么为什么要这样设计呢？其实```currentFiber```树就是代表的是已经渲染的组件对应的```Fiber```树，而```workInProgress```则是创建在内存中的树，这样做的目的是当发生组件更新的时候，先在内存中更新```workInProgress```,这种机制称为双缓存

前面说了fiber其实其实也是任务单元UnitOfWork，这里有个方法叫```performUnitOfWork```,当workInProgress创建成功之后，```performUnitOfWork```就一直循环调用，直到`workInProgress`为`null`
```javascript
function workLoopSync() {
    // Already timed out, so perform work without checking if we need to yield.
    while (workInProgress !== null) {
        performUnitOfWork(workInProgress);
    }
}
```
从这个循环可以看出，`performUnitOfWork`中一定会更新`workInProgress`，继续深入`performUnitOfWork`
```javascript
function performUnitOfWork(unitOfWork) {
    var current = unitOfWork.alternate;
    setCurrentFiber(unitOfWork);
    var next;

    if ((unitOfWork.mode & ProfileMode) !== NoMode) {
        startProfilerTimer(unitOfWork);
        next = beginWork$1(current, unitOfWork, subtreeRenderLanes);
        stopProfilerTimerIfRunningAndRecordDelta(unitOfWork, true);
    } else {
        next = beginWork$1(current, unitOfWork, subtreeRenderLanes);
    }

    resetCurrentFiber();
    unitOfWork.memoizedProps = unitOfWork.pendingProps;

    if (next === null) {
        // If this doesn't spawn new work, complete the current work.
        completeUnitOfWork(unitOfWork);
    } else {
        workInProgress = next;
    }
}
```
从上方代码可以看出，`workInProgress`传进来后，先和current一起进入到beginWork中，然后打断点看一下，`beginWork`会返回一个新的`fiberNode`而它就是`workInProgress`的`child`或者兄弟`fiberNode`，也可能是`null`,不为`null`则会更新`workInProgress`，如果为`null`则将`workInProgress`传入`completeUnitOfWork`中，
```javascript
function completeUnitOfWork(unitOfWork) {
    var completedWork = unitOfWork;
    var current = completedWork.alternate;
    var returnFiber = completedWork.return;
    
    // 省略
    var siblingFiber = completedWork.sibling;

    if (siblingFiber !== null) {
        // If there is more work to do in this returnFiber, do that next.
        workInProgress = siblingFiber;
        return;
    } // Otherwise, return to the parent
    
    completedWork = returnFiber; // Update the next thing we're working on in case something throws.
    
    workInProgress = completedWork;
}
```
在`completeUnitOfWork`中可以看到，如果这个`unitOfWork`没有`sibling`则更新`workInProgress`为父级Fiber

所以，其实在`performUnitOfWork`中不断执行的过程中，不断的更新`workInProgress`,这样将整颗树构建而成