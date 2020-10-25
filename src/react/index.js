import Component from "./Component";

const createElement = function (tag, attrs, ...childrens) {
    return {
        tag,
        attrs,
        childrens
    }
}

export default {
    createElement,
    Component
}