import Component from "./Component";

const createElement = function (type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            // childrens数组中会包含一些基本数据类型的数据比如string和number
            children: children.map(child => {
                return typeof child === "object" ? child : createTextElement(child)
            })
        }
    }
}

const createTextElement = function (text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: []
        }
    }
}

export default {
    createElement,
    Component
}