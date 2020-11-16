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
```
graph TD
    A[fiberRootNode] -->|current| B[currentFiber]
    B --> |stateNode| A
```