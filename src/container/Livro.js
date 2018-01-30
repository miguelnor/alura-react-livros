import React, { Component } from 'react';
import $ from 'jquery';
import CustomInput from '../component/CustomInput';
import CustomButton from '../component/CustomButton';
import CustomSelect from '../component/CustomSelect';
import Pubsub from 'pubsub-js';
import ErroHandler from '../helper/ErrorHandler';

class LivroForm extends Component {
    constructor() {
        super();
        this.state = { titulo: '', preco: '', autorId: '' };
        this.sendForm = this.sendForm.bind(this);
        this.setTitulo = this.setTitulo.bind(this);
        this.setPreco = this.setPreco.bind(this);
        this.setAutorId = this.setAutorId.bind(this);
    }

    setTitulo(event) {
        this.setState({ titulo: event.target.value });
    }

    setPreco(event) {
        this.setState({ preco: event.target.value });
    }

    setAutorId(event) {
        this.setState({ autorId: event.target.value });
    }

    sendForm(event) {
        event.preventDefault();
        $.ajax({
            url: 'http://localhost:8080/api/livros',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({ titulo: this.state.titulo, preco: this.state.preco, autorId: this.state.autorId }),
            success: resp => {
                Pubsub.publish('update-books-list', resp);
                this.setState({ titulo: '', preco: '', autorId: '' });
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
                    <CustomInput id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo} label="Titulo" />
                    <CustomInput id="preco" type="text" name="preco" value={this.state.preco} onChange={this.setPreco} label="Preco" />
                    <CustomSelect id="autor" name="autor" value={this.state.autorId} list={this.props.autors} onChange={this.setAutorId} label="Autor" />
                    <CustomButton type="submit" label="Gravar" />
                </form>
            </div>
        );
    }
}

class LivroTable extends Component {
    componentDidMount() {

        console.log(this.props.autors);
    }
    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Titulo</th>
                            <th>Preco</th>
                            <th>Autor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.list.map((livro) => {
                                return (
                                    <tr key={livro.id}>
                                        <td>{livro.titulo}</td>
                                        <td>{livro.preco}</td>
                                        <td>{livro.autor.nome}</td>
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

export default class LivroBox extends Component {
    constructor() {
        super();
        this.state = {
            livros: [],
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

        $.ajax({
            url: 'http://localhost:8080/api/livros',
            dataType: 'json',
            success: resp => {
                this.setState({ livros: resp });
            }
        });

        Pubsub.subscribe('update-books-list', (topic, newList) => {
            this.setState({ livros: newList });
        });
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de Livros</h1>
                </div>
                <div className="content" id="content">
                    <LivroForm autors={this.state.autores} />
                    <LivroTable list={this.state.livros} />
                </div>
            </div>
        );
    }
}