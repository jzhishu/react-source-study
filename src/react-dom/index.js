import React from "../react/";

// 一个指针用于保存下一个任务单元
let nextUnitOfWork = null;
// 一个变量表示fiber tree的根节点
let wipRoot = null;
// 一个变量表示之前渲染过的fiber tree
let currentRoot = null;
let deletions = null;

// 判断这个是不是dom元素的属性
const isProperty = key => (key !== "children") && isEvent(key);

const isNew = (prevProps, nextProps) => key => prevProps[key] !== nextProps[key];

const isGone = (nextProps) => key => !(key in nextProps);

const isEvent = key => key && key.startWidth("on");

function render(element, container) {
    // 吧rootDom初始化为最初的UnitOfWork
    wipRoot = {
        dom: container,
        props: {
            children: [element]
        },
        // 一个指针指向之前渲染过的fiber tree
        alternate: currentRoot
    }

    deletions = [];
    nextUnitOfWork = wipRoot;
}

function createDom(element) {
    // 首先吧根据element创建node, 如果是字符串则创建文本节点
    const dom =
        element.type === "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(element.type);

    // 遍历属性，吧属性添加到dom上
    Object.keys(element.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = element.props[name]
        })

    return dom;
}

// 用于循环执行任务单元的函数
function workLoop(deadLine) {
    // 是否需要中断执行
    let shouldYield = false;
    // 当nextUnitOfWork存在且不中断执行，则遍历
    while (nextUnitOfWork && !shouldYield) {
        // 执行新的下一个任务单元，且更新下一个任务单元的指针
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

        // 是否需要中止执行
        shouldYield = deadLine.timeRemaining() < 1;
    }

    if (!nextUnitOfWork && wipRoot) {
        // 到这里，整个fiber树已经创建完了，当最后一个任务单元执行，现在向页面中添加元素
        commitRoot();
    }

    // 浏览器在主进程空闲的时候会执行通过这个api注册的回调
    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

// 执行当前的任务单元，向页面中渲染dom，并且返回下一个页面单元
function performUnitOfWork(nextUnitOfWork) {
    // 先添加dom节点
    if (!nextUnitOfWork.dom) {
        nextUnitOfWork.dom = createDom(nextUnitOfWork);
    }
    // 因为任务单元有可能会被浏览器中断执行，所以不能再这里添加dom，不然有可能UI没渲染完被中断了
    // if (nextUnitOfWork.parent) {
    //     nextUnitOfWork.parent.dom.appendChild(dom);
    // }
    reconcileChild(nextUnitOfWork);
    // 搜索fiber，先找child，没有就找sibling，如果还没有就找parent继续循环
    if (nextUnitOfWork.child) {
        return nextUnitOfWork.child;
    }
    let nextFiber = nextUnitOfWork;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }

        nextFiber = nextFiber.parent;
    }
}

// diff算法实现
function reconcileChild(wipFiber) {
    // 所有的child创建fiber对象
    let index = 0;
    let prevSibling = null;
    let children = wipFiber.props.children;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child

    while (index < children.length || oldFiber != null) {
        let child = children[index];

        const sameType =
            oldFiber &&
            child &&
            oldFiber.type === child.type;
        let newFiber = null;

        if (sameType) {
            // 如果之前渲染过的fiber和新的fiber的type是一致的，比如都是div
            // 则直接按照新的props更新
            newFiber = {
                type: oldFiber.type,
                props: child.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE"
            }
        }
        if (child && !sameType) {
            // 如果type不一致，但是这里有新的fiber，则这里要创建一个新的dom元素
            newFiber = {
                type: child.type,
                props: child.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT"
            }
        }
        if (oldFiber && !sameType) {
            // 如果这里type不一致，但是oldFiber存在则删除之前的dom
            oldFiber.effectTag = "DELETION"
            deletions.push(oldFiber)
        }

        if (index === 0) {
            // 如果是第一次循环，是添加子节点
            wipFiber.child = newFiber;
        } else {
            // 为prevSibling添加兄弟节点
            prevSibling.sibling = newFiber;
        }

        // 更新prevSibling
        prevSibling = newFiber;
        index++;
    }
}

function commitRoot() {
    deletions.forEach(commitWork)
    commitWork(wipRoot.child);
    // 保存之前要渲染的fiber tree
    currentRoot = wipRoot;
    wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) {
        return;
    }

    const domParent = fiber.parent.dom;
    if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
        domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "DELETION" && fiber.dom) {
        domParent.removeChild(fiber.dom);
    } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    }
    // 递归链表
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function updateDom(domElement, prevProps, nextProps) {
    // 在prevProps上找出nextProps中不存在的propertyName，并且从dom上移除
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(nextProps))
        .forEach(propertyName => {
            dom[propertyName] = "";
        });

    // 在nextProps上找出与prevProps中值不同的属性名
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach(propertyName => {
            dom[propertyName] = nextProps[propertyName];
        });
}

export default {
    render
}