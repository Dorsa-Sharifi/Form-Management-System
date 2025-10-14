import React from 'react';
import backIcon from "@pages/../Files/Icons/left-arrow.png";
import { FormObject, ChoiceObject, PageData } from "@pages/Form/model/dataType";
import {Row, Col, Card, Button, Tag, Input} from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import { v4 as uuidv4 } from 'uuid';


interface FormPageProps {
    key: string;
    index: number;
    data: PageData;
    isPreview: boolean; // preview mode or not
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    save_func: Function;
}

interface FormPageState {
    count: number;
    modalShow: boolean;
    objects: FormObject[]; // page fields
    modalType: string;
    textQue: string;
    multiQue: string;
    choices: ChoiceObject[];
    // new fields for Q/A data type and required flag
    textType: 'shortText' | 'longText' | 'number' | 'bool';
    textRequired: boolean;
}

class FormPage extends React.Component<FormPageProps, FormPageState> {
    constructor(props: FormPageProps) {
        super(props);
        this.state = {
            count: 0,
            modalShow: false,
            modalType: 'multi',
            objects: this.props.data.data,
            textQue: '',
            multiQue: '',
            choices: [],
            textType: 'shortText',
            textRequired: false,
        };
    }

    componentDidUpdate(prevProps: FormPageProps, prevState: FormPageState) {
        if (this.props.data.data !== prevProps.data.data) {
            this.setState({ objects: this.props.data.data });
        }
    }

    showModal = (type: string) => {
        this.setState({
            modalType: type,
            modalShow: true,
            textQue: '',
            multiQue: '',
            choices: [],
            textType: 'shortText',
            textRequired: false,
        });
    }

    closeModal = () => {
        this.setState({ modalShow: false });
    }


    addMultiChoice = () => {
        const newObject: FormObject = {
            id: uuidv4(),
            type: 'multi',
            que: this.state.multiQue,
            choices: this.state.choices,
            created_at: Date.now(),
        };
        this.setState(prevState => ({
            objects: [...prevState.objects, newObject],
            multiQue: '',
            choices: [],
        }));

        setTimeout(() => {
            this.props.save_func(this.props.index, this.state.objects);
            this.closeModal();
        }, 300);
    }

    addTextBox = () => {
        const newObject: FormObject = {
            id: uuidv4(),
            type: 'textbox',
            que: this.state.textQue,
            choices: [],
            dataType: this.state.textType,
            required: this.state.textRequired,
            created_at: Date.now()
        };
        this.setState(prevState => ({
            objects: [...prevState.objects, newObject],
            textQue: '',
        }));

        setTimeout(() => {
            this.props.save_func(this.props.index, this.state.objects);
            this.closeModal();
        }, 300);
    }


    removeQuestion = (id: string) => {
        this.setState(prevState => ({
            objects: prevState.objects.filter((obj: FormObject) => obj.id !== id),
        }), () => {
            // Callback after state update
            this.props.save_func(this.props.index, this.state.objects);
        });
    }


    setTextQue = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ textQue: e.target.value });
    }

    setMultiQue = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ multiQue: e.target.value });
    }

    // handlers for new controls
    setTextType = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({ textType: e.target.value as any });
    }

    setTextRequired = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ textRequired: e.target.checked });
    }

    setChoiceTitle = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const object = this.state.choices[index];
        object.title = e.target.value;
        this.setState(prevState => ({
            choices: [
                ...prevState.choices.slice(0, index),
                object,
                ...prevState.choices.slice(index + 1),
            ],
        }));
    }

    choicesHandler() {
        return this.state.choices.map(choice => (
            <div className='choice' key={choice.index}>
                <span className={'index'}>{choice.index}</span>
                <input
                    className={'title'}
                    type='text'
                    value={choice.title}
                    onChange={(e) => this.setChoiceTitle(e, choice.index)}
                />
            </div>
        ));
    }

    addNewChoice = () => {
        const object: ChoiceObject = { index: this.state.choices.length, title: '' };
        this.setState(prevState => ({
            choices: [...prevState.choices, object],
        }));
    }

    modalContentHandler() {
        return (
            this.state.modalType === 'multi' ?
                <div className={'modal--multi'}>
                    <div className={'que'}>
                        <span className={'topic'}>Enter your question</span>
                        <input
                            className={'input'}
                            value={this.state.multiQue}
                            onChange={this.setMultiQue}
                        />
                    </div>
                    <div className={'choices'}>
                        {this.choicesHandler()}
                        <div className={'new'} onClick={this.addNewChoice}>
                            <span className={'topic'}>create Option</span>
                            <span className={'add'}>+</span>
                        </div>
                    </div>
                    <div className={'control'}>
                        <button className={'close'} onClick={this.closeModal}>back</button>
                        <button className={'submit'} onClick={this.addMultiChoice}>save</button>
                    </div>
                </div>
            :
                <div className={'modal--text'}>
                    <div className={'que'}>
                        <span className={'topic'}>Enter your question</span>
                        <input
                            className={'input'}
                            value={this.state.textQue}
                            onChange={this.setTextQue}
                        />
                    </div>
                    {/* new controls for data type & required */}
                    <div className={'options'}>
                        <label>
                            Data type
                            <select
                                value={this.state.textType}
                                onChange={this.setTextType}
                            >
                                <option value="shortText">short text</option>
                                <option value="longText">long text</option>
                                <option value="number">number</option>
                                <option value="bool">True/False</option>
                            </select>
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={this.state.textRequired}
                                onChange={this.setTextRequired}
                            />
                            optional
                        </label>
                    </div>
                    <div className={'control'}>
                        <button className={'close'} onClick={this.closeModal}>back</button>
                        <button className={'submit'} onClick={this.addTextBox}>save</button>
                    </div>
                </div>
        );
    }

    formObjectChoiceHandler(choices: ChoiceObject[]) {
        return choices.map((choice, i) => (
            <Tag color="blue">{choice.title}</Tag>
        ));
    }





// Within your class component:

    formObjectsHandler() {
        return (
            <div style={{ padding: '0 32px' }}> {/* Horizontal padding on parent */}
                <Row gutter={[16, 16]} justify="center">
                    {this.state.objects.sort((a, b) => a.created_at - b.created_at).map((object, i) => (
                        <Col
                            key={object.id}
                            style={{
                                flex: '0 0 350px', // fixed width
                                maxWidth: 350,
                                minWidth: 250,
                                width: '100%',
                                display: "flex", // container spreads to card
                                justifyContent: "center",
                            }}
                        >
                            <Card
                                type="inner"
                                title={(
                                    <span>
                                    <Tag color="blue">{
                                        object.type === 'multi'
                                                ? 'MULTI' : object.type === 'textbox'
                                                    ? (object.dataType || '').toUpperCase()
                                                    : "UNKNOWN TYPE"
                                    }</Tag>
                                    <span style={{ marginLeft: 8 }}>{object.que}</span>
                                </span>
                                )}
                                extra={
                                    <Button
                                        type="primary"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => this.removeQuestion(object.id)}
                                        size="small"
                                    >
                                        Delete
                                    </Button>
                                }
                                style={{
                                    width: '100%',
                                    minHeight: 160,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                }}
                                bodyStyle={{ paddingTop: 16 }}
                            >
                                {object.type === 'multi' ? (
                                    this.formObjectChoiceHandler(object.choices)
                                ) : (
                                    <Input placeholder="Answer..." disabled />
                                )}
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        );
    }






render() {
        return (
            <div className={'form--page'} key={this.props.key}>
                <div className={'object--bar'}>
                    <div className={'multi--choice'} onClick={() => this.showModal('multi')}>
                        <span>Multi choice</span>
                    </div>
                    <div className={'text--box'} onClick={() => this.showModal('textbox')}>
                        <span>Q/A</span>
                    </div>
                </div>
                <div className={'form'}>
                    {this.formObjectsHandler()}
                </div>
                <div className={'modal'} style={{ display: this.state.modalShow ? 'flex' : 'none' }}>
                    <div className={'control'}>
                        <img src={backIcon} onClick={this.closeModal} />
                    </div>
                    {this.modalContentHandler()}
                </div>
                {this.props.isPreview ? <div className={'preview--cover'} /> : null}
            </div>
        );
    }
}

export default FormPage;