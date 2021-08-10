import React, { ChangeEvent } from "react";
import { withRouter, RouteComponentProps, } from "react-router-dom";
import { aesDecrypt } from "../../utils/encryptUtil";
import styles from './home.module.scss';


class HomeComponentInner extends React.PureComponent<RouteComponentProps> {
  state = {
    key1: '',
    key2: '',
    encodeData: '',
    decodeData: '',
    timestamp: '',
    convertDate: '',
  };

  didChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    const propName = e.target.dataset.keyname || "";
    this.setState({
      [propName]: newVal
    });
  }


  didTextAreaChanged = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    const propName = e.target.dataset.keyname || "";
    this.setState({
      [propName]: newVal
    });
  }

  verify = () => {
    try {
      const decodeData1 = aesDecrypt(this.state.encodeData, this.state.key2);
      const decodeData2 = aesDecrypt(decodeData1, this.state.key1);
      if (decodeData2) {
        this.setState({
          decodeData: decodeData2
        });
      } else {
        alert("Decode error");
      }
    } catch (e) {
      alert(e.message);
    }
  }

  convertTimestamp = () => {
    if (this.state.timestamp) {
      const newDate = new Date(parseInt(this.state.timestamp));
      this.setState({
        convertDate: newDate.toString()
      });
    }
  }

  render() {
    return <div className={styles.outerContainer}>
      <div className={styles.container}>
        <div className={styles.header}>Verify prevent cheat data</div>
        <div>Key1</div>
        <div><input type="text" value={this.state.key1} onChange={this.didChanged} data-keyname="key1"></input></div>
        <div>Key2</div>
        <div><input type="text" value={this.state.key2} onChange={this.didChanged} data-keyname="key2"></input></div>
        <div>Encode Data</div>
        <div><textarea value={this.state.encodeData} onChange={this.didTextAreaChanged} data-keyname="encodeData"></textarea></div>
        <div style={{ textAlign: 'center' }}><button type="button" onClick={this.verify}>Verify</button></div>
        <div>Result</div>
        <div>{this.state.decodeData}</div>
        <div style={{ paddingTop: 50 }}>Verify timestamp</div>
        <div>
          <input style={{ width: 250 }} type="text" value={this.state.timestamp} onChange={this.didChanged} data-keyname="timestamp"></input>
          <button type="button" onClick={this.convertTimestamp}>Convert</button>
        </div>
        <div>{this.state.convertDate && this.state.convertDate.toString()}</div>
      </div>
    </div>;
  }
}

export const HomeComponent = withRouter(HomeComponentInner);
