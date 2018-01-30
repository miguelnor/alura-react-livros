import React, { Component } from 'react';
import $ from 'jquery';
import CustomInput from '../component/CustomInput';
import CustomButton from '../component/CustomButton';
import Pubsub from 'pubsub-js';
import ErroHandler from '../helper/ErrorHandler';

class AutorForm extends Component {
    constructor() {
        super();
        this.state = { nome: '', email: '', senha: '' };
        this.sendForm = this.sendForm.bind(this);
        this.setNome = this.setNome.bind(this);
        this.setEmail = this.setEmail.bind(this);
        this.setSenha = this.setSenha.bind(this);
    }

    setNome(event) {
        this.setState({ nome: event.target.value });
    }

    setEmail(event) {
        this.setState({ email: event.target.value });
    }

    setSenha(event) {
        this.setState({ senha: event.target.value });
    }

    sendForm(event) {
        event.preventDefault();
        $.ajax({
            url: 'http://localhost:8080/api/autores',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({ nome: this.state.nome, email: this.state.email, senha: this.state.senha }),
            success: resp => {
                Pubsub.publish('update-autors-list', resp);
                this.setState({ nome: '', email: '', senha: '' });
                console.log('Enviado com sucesso!');
            },
            error: resp => {
                if (resp.status === 400) {
                    new ErroHandler().publishErrors(resp.responseJSON);
                    console.log('Erro na requisicao');
                }
            },
            beforeSend: function () {
                Pubsub.publish('clear-errors', {});
            }
        });
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.sendForm} method="post">
                    <CustomInput id="nome" type="text" name="nome" value={this.state.nome} onChange={this.setNome} label="Nome" />
                    <CustomInput id="email" type="email" name="email" value={this.state.email} onChange={this.setEmail} label="Email" />
                    <CustomInput id="senha" type="password" name="senha" value={this.state.senha} onChange={this.setSenha} label="Senha" />
                    <CustomButton type="submit" label="Gravar" />
                </form>

            </div>
        );
    }
}

class AutorTable extends Component {
    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>E-mail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.list.map(function (autor) {
                                return (
                                    <tr key={autor.id}>
                                        <td>{autor.nome}</td>
                                        <td>{autor.email}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default class AutorBox extends Component {
    constructor() {
        super();
        this.state = {
            autores: []
        };
    }

    componentWillMount() {
        $.ajax({
            url: 'http://localhost:8080/api/autores',
            dataType: 'json',
            success: resp => {
                this.setState({ autores: resp });
            }
        });

        Pubsub.subscribe('update-autors-list', (topic, newList) => {
            this.setState({ autores: newList });
        });
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de Autores</h1>
                </div>
                <div className="content" id="content">
                    <AutorForm />
                    <AutorTable list={this.state.autores} />
                </div>
            </div>
        );
    }
}