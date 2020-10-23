const createElement = function (tag, attrs, ...childrens) {
    return {
        tag,
        attrs,
        childrens
    }
}

export default {
    createElement
}