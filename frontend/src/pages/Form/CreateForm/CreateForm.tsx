import React from 'react';
import CreateNewForm from "@pages/Form/CreateForm/CreateNewForm";
import { withParams } from './withParams';
import './CreateForm.css';
import {Layout} from "antd";
import {Content, Header} from "antd/es/layout/layout";
import { getFormDetails } from '@services/apiService';
import FormUserAccess, { UserItem } from './FormUserAccess';

interface CreateFormProps {
  name: string;
  params: { formId?: string };
  create_or_edit?: string;
}

interface CreateFormState {
  count: number;
  stage: string;
  formTitle: string;
  formDescription: string;
  formReady: boolean;
}

class CreateForm extends React.Component<CreateFormProps, CreateFormState> {
    private formPageRef: React.RefObject<CreateNewForm | null>;
    private userAccessRef: React.RefObject<any>;


    constructor(props: CreateFormProps) {
        super(props);
        this.formPageRef = React.createRef();
        this.userAccessRef = React.createRef();
        this.state = {
            formReady: false,
            count: 0,
            stage: props.create_or_edit === 'edit' ? 'create' : 'zero',
            formTitle: '',
            formDescription: ''
        };
    }

    async componentDidMount() {
        if (this.props.create_or_edit === 'edit' && this.props.params.formId) {
            try {
                const formDetails = await getFormDetails(this.props.params.formId);
                this.setState({
                    formTitle: formDetails.name,
                    formDescription: formDetails.description
                });
            } catch (error) {
                console.error('Failed to load form details:', error);
            }
        }
    }

    handleExport = () => {
        console.log('handleExport');
        if (this.formPageRef.current) {
            console.error('running the export function ...');
            this.formPageRef.current.exportFormAsJSON();
        } else {
            console.error('this.formPageRef is not set');
        }
    };

    setFormReady = (formReady: boolean) => {
        this.setState({ formReady: formReady });
    }

    setStage = (stage: string) => {
        if (this.state.formTitle.length < 3) {
            alert('form title should be at least 3 characters');
            return;
        }
        this.setState({ stage:stage });
    };

    setTitle = (e: React.ChangeEvent<HTMLInputElement>) =>
        this.setState({ formTitle: e.target.value });

    render() {
        return(
                <Layout style={{height:'100%'}}>
                    <Header style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        padding: '0 20px',
                        backgroundColor: '#003a4a',
                    }}>
                        <button
                            onClick={this.handleExport}
                            disabled={!this.formPageRef.current}
                            style={{
                                height: '80%',
                                lineHeight: '80%',
                                padding: '0 12px',
                                backgroundColor: this.formPageRef.current ? '#1890ff' : '#d9d9d9',
                                color: this.formPageRef.current ? '#fff' : '#aaa',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '16px',
                                cursor: this.formPageRef.current ? 'pointer' : 'not-allowed',
                                boxShadow: this.formPageRef.current ? '0 1px 4px rgba(0, 0, 0, 0.1)' : 'none',
                                transition: 'background-color 0.3s ease',
                            }}
                            onMouseEnter={
                                (e) =>
                                    e.currentTarget.style.backgroundColor = this.formPageRef.current ? '#40a9ff' : '#d9d9d9'
                            }
                            onMouseLeave={
                                (e) =>
                                    e.currentTarget.style.backgroundColor = this.formPageRef.current ? '#1890ff' : '#d9d9d9'
                            }
                        >
                            Export as JSON
                        </button>
                    </Header>
                    <Content>
                        <div className={'create--form'}>
                            <div className={'templates'} style={{gridArea:'tm'}}>
                                <div className={'topic'}><span>Templates</span></div>
                                {/*<TemplatesBar />*/}
                                {/*    TO DO: add templates here */}
                            </div>
                            <div className={'users'} style={{gridArea:'uu'}}>
                                <div className={'topic'}><span>Users</span></div>
                                <FormUserAccess
                                  ref={this.userAccessRef}
                                  formId={this.props.create_or_edit === 'edit' ? this.props.params.formId : undefined}
                                />
                            </div>
                            {
                                (this.state.stage === 'zero') ?
                                    <div className={'stage zero'} style={{gridArea:'st'}}>
                                        <span >Enter the form name</span>
                                        <input className={'create-input'} onChange={(e) => {this.setTitle(e)}}></input>
                                        <button className={'create'} onClick={() => this.setStage('create')}>Continue</button>
                                    </div>
                                    :
                                    (this.props.create_or_edit === 'edit') ?
                                        <div className={'stage create'} style={{gridArea:'st'}}>
                                            <CreateNewForm
                                                setFormReady={this.setFormReady}
                                                title={this.state.formTitle}
                                                description={this.state.formDescription}
                                                create_or_edit={this.props.create_or_edit}
                                                formId={this.props.params.formId}
                                                ref={this.formPageRef}
                                                userAccessRef={this.userAccessRef}
                                            />
                                        </div>
                                        :
                                        <div className={'stage create'} style={{gridArea:'st'}}>
                                            <CreateNewForm
                                                setFormReady={this.setFormReady}
                                                title={this.state.formTitle}
                                                ref={this.formPageRef}
                                                userAccessRef={this.userAccessRef}
                                            />
                                        </div>
                            }
                        </div>
                    </Content>
                </Layout>
        )
    }

}

export default withParams(CreateForm);
