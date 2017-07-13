import {h, render, Component} from 'preact';
import {bind} from 'decko';

class App extends Component {
  constructor() {
    super();
    this.state = {
      press: false,
      startX: 0,
      startY: 0,
      currentX: -10,
      currentY: -10,
      screenX: 0,
      screenY: 0
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown, true);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  @bind
  handleMouseDown({clientX, clientY, screenX, screenY, buttons}) {
    if (buttons === 1) {
      this.setState({
        press: true,
        startX: clientX,
        startY: clientY,
        currentX: clientX,
        currentY: clientY,
        screenX,
        screenY
      });
    } else {
      this.props.onCancel();
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
      const {startX, startY, currentX, currentY, screenX, screenY} = this.state;
      const width = Math.abs(startX - currentX);
      const height = Math.abs(startY - currentY);

      if (width < 10 && height < 10) {
        this.props.onCapture({
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          screenX: screenX - startX,
          screenY: screenY - startY
        });
      } else {
        this.props.onCapture({
          x: Math.min(startX, currentX),
          y: Math.min(startY, currentY),
          width: Math.max(width, 100),
          height: Math.max(height, 100),
          screenX,
          screenY
        });
      }
    }
  }

  @bind
  handleKeyDown({keyCode}) {
    if (keyCode === 27) { // Escape
      this.props.onCancel();
    }
  }

  render() {
    const {press, startX, startY, currentX, currentY} = this.state;
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
      <div style={{
        position: 'absolute',
        left: `${Math.min(startX, currentX)}px`,
        top: `${Math.min(startY, currentY)}px`,
        width: press ? `${Math.abs(startX - currentX)}px` : 0,
        height: press ? `${Math.abs(startY - currentY)}px` : 0,
        outline: `${window.innerWidth + window.innerHeight}px solid rgba(50, 50, 50, .5)`
      }}/>
      {!press && <div style={{
        position: 'absolute',
        left: `${currentX}px`,
        top: 0,
        width: '0px',
        height: '100%',
        borderLeft: '1px solid white'
      }}/>}
      {!press && <div style={{
        left: 0,
        top: `${currentY}px`,
        position: 'absolute',
        width: '100%',
        height: '0px',
        borderTop: '1px solid white'
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

const handleCancel = () => {
  render('', document.body, root);
};

root = render(<App onCapture={handleCapture} onCancel={handleCancel}/>, document.body);