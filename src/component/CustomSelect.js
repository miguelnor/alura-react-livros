import React, { Component } from 'react';
import Pubsub from 'pubsub-js';

export default class CustomSelect extends Component {
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
                <select value={this.props.value} id={this.props.name} name={this.props.name} onChange={this.props.onChange}>
                    <option value="">Selecione</option>
                    {
                        this.props.list.map(function (autor) {
                            return (
                                <option key={autor.id} value={autor.id}>
                                    {autor.nome}
                                </option>
                            );
                        })
                    }
                </select>
                <span className="error">{this.state.errorMsg}</span>
            </div>
        );
    }
}