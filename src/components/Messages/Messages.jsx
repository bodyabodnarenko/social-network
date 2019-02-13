import React, { Component, Fragment } from "react";
import {
  Segment,
  CommentGroup,
  Label,
  Grid,
  GridColumn,
  LabelGroup
} from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader/MessagesHeader";
import MessageForm from "./MessageForm/MessageForm";
import firebase from "../../firebase";
import Message from "./Message/Message";

export class Messages extends Component {
  state = {
    messaegsRef: firebase.database().ref("messages"),
    messages: [],
    messagesLoading: true,
    numUniqueUsers: "",
    searchResults: [],
    searchKey: ""
  };

  componentDidMount() {
    if (this.props.channel && this.props.user) {
      console.log("yeah");
      this.addListeners(this.props.channel.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.channel && nextProps.user) {
      console.log(nextProps.channel.id);
      this.addListeners(nextProps.channel.id);
    }
  }

  addListeners = channedId => {
    this.addMessageListener(channedId);
  };

  addMessageListener = channedId => {
    let loadedMessages = [];

    this.state.messaegsRef.child(channedId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      this.countUniqueUsers(loadedMessages);
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      });
    });
    if (!loadedMessages.length > 0) {
      this.setState({
        messages: [],
        messagesLoading: false
      });
    }
  };

  handleSearchChange = () => event => {
    this.setState(
      {
        searchKey: event.target.value
      },
      () => this.handleSearchMessage()
    );
  };

  handleSearchMessage = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchKey, "gi");
    console.log(channelMessages);
    this.setState({
      searchResults: channelMessages.filter(message => {
        if (message.content) {
          return message.content.match(regex);
        }
      })
    });
  };

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    this.setState({
      numUniqueUsers: `${uniqueUsers.length} user${
        uniqueUsers.length === 1 ? "" : "s"
      }`
    });
  };

  displayChannelName = channel => (channel ? `${channel.name}` : "");

  displayMessages = messages => {
    if (messages.length > 0) {
      return messages.map(message => (
        <Message
          key={message.timestamp}
          message={message}
          user={this.props.user}
        />
      ));
    }
  };

  render() {
    return (
      <Fragment>
        <MessagesHeader
          search={this.handleSearchChange}
          channelName={this.displayChannelName(this.props.channel)}
          numUniqueUsers={this.state.numUniqueUsers}
        />
        <Segment>
          <CommentGroup className="messages">
            {this.state.messages.length > 0 ? (
              this.state.searchKey ? (
                this.displayMessages(this.state.searchResults)
              ) : (
                this.displayMessages(this.state.messages)
              )
            ) : (
              <Label style={{color:'#fff',background:'#e6186d'}} size="big" content="No messages yet!" />
            )}
          </CommentGroup>
        </Segment>
        <MessageForm
          channel={this.props.channel}
          user={this.props.user}
          messagesRef={this.state.messaegsRef}
        />
      </Fragment>
    );
  }
}

export default Messages;
