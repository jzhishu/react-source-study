const render = function (vnode, container) {
    // 如果vnode是字符串，则直接返回字符串节点
    if (typeof vnode === "string") {
        // 创建文本节点
        const textDom = document.createTextNode(vnode);
        return container.appendChild(textDom);
    }

    // 如果是对象
    // 1、根据tag创建一个dom对象
    let dom = document.createElement(vnode.tag);
    // 2、遍历属性为，dom添加属性
    for (let atr in vnode.attrs) {
        setAttribute(dom, atr, vnode.attrs[atr]);
    }
    // 3、把dom节点插入到container中
    container.appendChild(dom);
    // 4、遍历childrens数组，递归调用render，此时的dom就是container了
    vnode.childrens.forEach(children => {
        render(children, dom);
    });
}

let setAttribute = function (dom, key, value = "") {
    if (key === "style") {
        // 如果key为style，value有可能是字符串，也有可能是个对象
        if (typeof value === "string") {
            // 如果style为字符串,直接赋值给dom
            dom.style.cssText = value;
        } else if (typeof value === "object") {
            // 如果style为对象，遍历对象为dom赋值
            for (let k in value) {
                dom.style[k] = value;
            }
        }
    } else if (/on\w+/.test(key)) {
        // 如果key为事件，那么key转换为小写
        dom.setAttribute(key.toLowerCase(), value);
    } else {
        // 既不是style，也不是事件
        dom.setAttribute(key, value);
    }
}

export default {
    render
}