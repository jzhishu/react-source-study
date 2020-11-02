import React from "../react/";

// 定义一个指针用于保存下一个任务单元
let nextUnitOfWork = null;
let wipRoot = null;

function render(element, container) {
    // 吧rootDom初始化为最初的UnitOfWork
    wipRoot = {
        dom: container,
        props: {
            children: [element]
        }
    }
    nextUnitOfWork = wipRoot;
}

function createDom(element) {
    // 首先吧根据element创建node, 如果是字符串则创建文本节点
    const dom =
        element.type === "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(element.type);

    // 判断这个是不是dom元素的属性
    const isProperty = key => key !== "children";

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

    // 当最后一个任务单元执行，想页面中添加元素
    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }

    // 浏览器在主进程空闲的时候会执行通过这个api注册的回调
    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

// 执行当前的任务单元，向页面中渲染dom，并且返回下一个页面单元
function performUnitOfWork(nextUnitOfWork) {
    // 取出fiber中的而一些指针
    // const { dom, parent, props } = nextUnitOfWork;
    // 先添加dom节点
    if (!nextUnitOfWork.dom) {
        nextUnitOfWork.dom = createDom(nextUnitOfWork);
    }
    // 因为任务单元有可能会被浏览器中断执行，所以不能再这里添加dom，不然有可能UI没渲染完被中断了
    // if (nextUnitOfWork.parent) {
    //     nextUnitOfWork.parent.dom.appendChild(dom);
    // }
    // 所有的child创建fiber对象
    let index = 0;
    let prevSibling = null;

    while (index < nextUnitOfWork.props.children.length) {
        let child = nextUnitOfWork.props.children[index];

        let newFiber = {
            type: child.type,
            props: child.props,
            parent: nextUnitOfWork,
            dom: null
        }

        if (index === 0) {
            // 如果是第一次循环，是添加子节点
            nextUnitOfWork.child = newFiber;
        } else {
            // 为prevSibling添加兄弟节点
            prevSibling.sibling = newFiber;
        }

        // 更新prevSibling
        prevSibling = newFiber;
        index++;
    }

    // 搜索fiber，先找child，没有就找sibling，如果还没有就找parent继续循环
    if (nextUnitOfWork.child) {
        return nextUnitOfWork.nextUnitOfWork;
    }
    let nextFiber = nextUnitOfWork;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }

        nextFiber = nextFiber.parent;
    }
}

function commitRoot() {
    commitWork(wipRoot.child);
    wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) {
        return;
    }

    const domParent = fiber.parent.dom;
    domParent.appendChild(fiber.dom);
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

export default {
    render
}