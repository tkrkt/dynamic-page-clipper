import {h, render, Component} from 'preact';
import {bind} from 'decko';

class App extends Component {
  constructor() {
    super();
    this.state = {
      press: false,
      finished: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0
    };
  }

  @bind
  handleMouseDown({clientX, clientY}) {
    if (!this.state.finished) {
      this.setState({
        press: true,
        startX: clientX,
        startY: clientY,
        currentX: clientX,
        currentY: clientY
      });
    }
  }

  @bind
  handleMouseMove({clientX, clientY}) {
    this.setState({
      currentX: clientX,
      currentY: clientY
    });
  }

  @bind
  handleMouseUp() {
    if (this.state.press) {
      const {startX, startY, currentX, currentY} = this.state;
      this.props.onCapture({
        x: Math.min(startX, currentX),
        y: Math.min(startY, currentY),
        width: Math.abs(startX - currentX),
        height: Math.abs(startY - currentY)
      });
    }
  }

  render() {
    const {press, startX, startY, currentX, currentY, finished} = this.state;
    return <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: 10000000
      }}
      onMouseDown={this.handleMouseDown}
      onMouseMove={this.handleMouseMove}
      onMouseUp={this.handleMouseUp}
    >
      {!finished && <div style={{
        position: 'absolute',
        left: `${currentX}px`,
        top: 0,
        width: '0px',
        height: '100%',
        borderLeft: '1px dashed red'
      }}/>}
      {!finished && <div style={{
        left: 0,
        top: `${currentY}px`,
        position: 'absolute',
        width: '100%',
        height: '0px',
        borderTop: '1px dashed red'
      }}/>}
      {press && <div style={{
        position: 'absolute',
        left: `${Math.min(startX, currentX)}px`,
        top: `${Math.min(startY, currentY)}px`,
        width: `${Math.abs(startX - currentX)}px`,
        height: `${Math.abs(startY - currentY)}px`,
        border: '2px solid red',
        boxSizing: 'border-box'
      }}/>}
    </div>;
  }
}

let root;

const handleCapture = rect => {
  render('', document.body, root);
  chrome.runtime.sendMessage({
    type: 'rect',
    rect,
    page: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  });
};

root = render(<App onCapture={handleCapture} />, document.body);