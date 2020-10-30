import React from "./src/react";
import ReactDOM from "./src/react-dom"

/* 
    https://pomb.us/build-your-own-react/
*/

// function click() { alert("执行一次点击") };

// class Door extends React.Component {
//     constructor(props) {
//         super(props);
//     }

//     componentWillMount() {
//         console.log("componentWillMount: constructor执行完了，但是dom还没渲染");
//     }

//     componentWillReceiveProps() {
//         console.log("componentWillReceiveProps: 重新获取了props，但还没更新");
//     }

//     componentDidMount() {
//         console.log("componentDidMount: dom已经渲染了");
//     }

//     componentWillUnmount() {
//         console.log("componentWillUnmount: 组件即将卸载");
//     }

//     shouldComponentUpdate() {
//         console.log("shouldComponentUpdate: 是否要更新组件");
//     }

//     componentWillUpdate() {
//         console.log("componentWillUpdate: 组件即将更新");
//     }

//     componentDidUpdate() {
//         console.log("componentDidUpdate: 组件更新完成");
//     }

//     render() {
//         return (
//             <b>{this.props.text}</b>
//         )
//     }
// }

function Home(props) {
    return (
        <div className="relement" title="黑子" onClick={click} style="background-color: red">
            hello, <Door text="React111" />
        </div>
    )
}

let element = (
    <div className="relement" title="hello" style="background-color: red">
        hello, React
    </div>
)

// 为什么使用在这里只使用了ReactDOM的render方法，却要引入react？
// 因为render接收的第一个参数是一个虚拟dom，而组件--->虚拟dom需要调用
// React.createElement
ReactDOM.render(element, document.getElementById("root"));

