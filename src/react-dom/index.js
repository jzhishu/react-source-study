import React from "../react/";

// vnode可能是字符串, 虚拟dom对象, 函数组件, 类组件
const render = function (vnode, container) {
    const dom = _render(vnode)
    return container.appendChild(dom);
}

const _render = function(vnode){
     // 如果vnode是字符串，则直接返回字符串节点
     if (typeof vnode === "string") {
        // 创建文本节点
        return document.createTextNode(vnode);
    }

    // 如果是函数组件或者是类组件，由babel给transform之后传进来的都是function
    if(typeof vnode.tag === "function"){
        // 1，创建组件
        const component = createComponent(vnode.tag, vnode.attrs);
        // 2, 渲染组件拿到虚拟dom
        const _vnode = component.render();
        // 3, 递归渲染虚拟dom
        return _render(_vnode);
    }

    // 如果是对象
    // 1、根据tag创建一个dom对象
    let dom = document.createElement(vnode.tag);
    // 2、遍历属性为，dom添加属性
    for (let atr in vnode.attrs) {
        setAttribute(dom, atr, vnode.attrs[atr]);
    }
    // 3、遍历childrens数组，递归调用render，此时的dom就是container了
    vnode.childrens.forEach(children => {
        render(children, dom);
    });

    return dom;
}

const createComponent = function(constructor, props){
    let instance = null;
    
    if(constructor.prototype && typeof constructor.prototype.render === "function"){
        // 如果原型链上有定义render方法则为类组件
        instance = new constructor(props);
    }else{
        // 如果是函数组件,则构造成类Component的实例
        instance = new React.Component(props);
        // 实例的构造函数指向函数组件
        instance.constructor = constructor;
        // 重写render函数
        instance.render = function(){
            return constructor(props);
        }
    }

    return instance;
}

const setAttribute = function (dom, key, value = "") {
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
        // dom.setAttribute(key.toLowerCase(), value);
        dom[key.toLowerCase()] = value;
    } else {
        // 既不是style，也不是事件
        dom.setAttribute(key, value);
    }
}

export default {
    render
}