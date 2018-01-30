import React, { Component } from 'react';
import Pubsub from 'pubsub-js';

export default class CustomInput extends Component {
    constructor() {
        super();
        this.state = { errorMsg: '' };
    }

    componentDidMount() {
        Pubsub.subscribe('validation-error', (topic, error) => {
            if (error.field === this.props.name)
                this.setState({ errorMsg: error.defaultMessage });
        });

        Pubsub.subscribe('clear-errors', topic => {
            this.setState({ errorMsg: '' });
        });
    }

    render() {
        return (
            <div className="pure-control-group">
                <label htmlFor={this.props.id}>{this.props.label}</label>
                <input {...this.props} />
                <span className="error">{this.state.errorMsg}</span>
            </div>
        );
    }
}