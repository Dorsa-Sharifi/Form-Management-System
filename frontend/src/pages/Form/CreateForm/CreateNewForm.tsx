import React from 'react';
import FormPage from "@pages/Form/CreateForm/FormPage.tsx";
import {FormData, FormObject, PageData} from "@pages/Form/model/dataType";
import {ToastContainer, toast} from "react-toastify";
import { mapFrontendToBackend, createForm, updateForm } from '@services/apiService';
import { addUsersToForm } from '../services/formApi';

interface CreateNewFormProps {
    title: string;
    description?: string;
    create_or_edit?: string;
    formId?: string;
    setFormReady: (formReady: boolean) => void;
    userAccessRef?: React.RefObject<any>;
}
interface CreateNewFormState {
    pages:number[];
    formName: string;
    formDesc: string;
    modalShow: boolean;
    currentPage: number;
    all_sending_data : FormData; // form's data
}


class CreateNewForm extends React.Component<CreateNewFormProps, CreateNewFormState> {

    constructor(props: CreateNewFormProps) {
        super(props);
        this.state = {
            pages: [],
            formName: this.props.title,
            formDesc: '',
            modalShow: false,
            currentPage: -1,
            all_sending_data: {
                pages: []
            }
        };

    }

    async componentDidMount() {
        if (this.props.create_or_edit === 'edit' && this.props.formId) {
            // Dynamically import the API to avoid circular dependencies
            const {fetchFormData} = await import('../services/formApi');
            try {
                const formData = await fetchFormData(this.props.formId);
                // Assuming formData has the same structure as FormData
                this.setState({
                    all_sending_data: formData,
                    pages: formData.pages.map((_: unknown, idx: number) => idx),
                    currentPage: 0,
                    formName: this.props.title || '',
                    formDesc: this.props.description || ''
                });
            } catch (error) {
                console.error('Failed to fetch form data:', error);
            }
        }
        this.props.setFormReady(true);
    }

    componentDidUpdate(prevProps: CreateNewFormProps) {
        // Update form name and description when props change (e.g., after form details are loaded)
        if (prevProps.title !== this.props.title || prevProps.description !== this.props.description) {
            this.setState({
                formName: this.props.title,
                formDesc: this.props.description || ''
            });
        }
    }

     exportFormAsJSON = () => {
        const { all_sending_data } = this.state;

        // Use the same mapping function for consistency
        const formExport = mapFrontendToBackend(all_sending_data, this.props.title, this.props.description || '');

        const json = JSON.stringify(formExport, null, 2); // pretty print with 2-space indent
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.props.title || 'form'}.json`;
        link.click();

        URL.revokeObjectURL(url); // cleanup
    };

    getFormMap = () => {
        const { all_sending_data } = this.state;

        // Use the proper mapping function from apiService
        // Use props.title and props.description directly to ensure we always have the correct values
        return mapFrontendToBackend(all_sending_data, this.props.title, this.props.description || '');
    }


    registerForm = async () => {
        const isEditMode = this.props.create_or_edit === 'edit' && this.props.formId;

        try {
            const formData = this.getFormMap();
            
            if (isEditMode) {
                await updateForm(this.props.formId!, formData);
                // No need to add users, handled in edit mode UI
                toast.success("Form has been successfully updated!", {
                    onClose: () => {
                        window.location.href = "/panel";
                    },
                    autoClose: 1500,
                });
            } else {
                // Create form, then add users if any
                const createdForm = await createForm(formData);
                if (this.props.userAccessRef && this.props.userAccessRef.current) {
                    const userIds = this.props.userAccessRef.current.getSelectedUsers();
                    if (userIds && userIds.length > 0) {
                        await addUsersToForm(createdForm.id, userIds);
                    }
                }
                toast.success("Form has been successfully registered!", {
                    onClose: () => {
                        window.location.href = "/panel";
                    },
                    autoClose: 1500,
                });
            }
        } catch (err) {
            console.error("Network error:", err);
            toast.error("Failed to save form. Please try again.");
        }
    };


    showPage = (index:number) => {
        console.log(index);
        this.setState({currentPage: index});
    }

    addNewPage = () => {
        const index = this.state.pages.length;
        const current = this.state.all_sending_data;
        const updated:FormData = {pages: [...current.pages , {data:[]}] }
        console.log(updated);
        this.setState(prevState => ({
            pages: [...prevState.pages, index],
            currentPage: index,
            all_sending_data: updated,
        }));
    }

    pagesHandler() {
        const list = [];
        for (const pageIndex of this.state.pages) {
            const tag = (this.state.currentPage === pageIndex) ? 'active' : 'inactive';
            const data:PageData = this.state.all_sending_data.pages[pageIndex];
            list.push(
                <div className={'page--preview ' + tag} key={'page--preview--'+pageIndex.toString()} onClick={() => this.showPage(pageIndex)}>
                    <FormPage
                        isPreview={true}
                        key={'formpage--preview--'+pageIndex.toString()} index={pageIndex}
                        data={data}
                        save_func={this.savePagesData}
                    />
                </div>
            );
        }
        return (
            list
        );
    }

    contentHandler() {
        const list = [];
        for (const pageIndex of this.state.pages) {
            const data:PageData = this.state.all_sending_data.pages[pageIndex];
            list.push(
                <div className={'page--content'} style={{display:(this.state.currentPage === pageIndex) ? 'flex' : 'none'}} key={'page--content--'+pageIndex.toString()} onClick={() => this.showPage(pageIndex)}>
                    <FormPage isPreview={false}
                              key={'formpage--content--'+pageIndex.toString()}
                              index={pageIndex} data={data}
                              save_func={this.savePagesData}
                    />
                </div>
            );
        }
        return (
            list
        );
    }

    savePagesData = (pageIndex: number, data: FormObject[]) => {
        if (pageIndex >= this.state.pages.length) { return;}

        const pageNewData:PageData = {data: data}
        const current = this.state.all_sending_data;
        const updated:FormData = {pages: [...current.pages.slice(0, pageIndex), pageNewData , ...current.pages.slice(pageIndex + 1)]};
        this.setState({all_sending_data: updated});
    }

    render() {
        return(
            <div className={'create--new--form'}>
                <div className={'title'} style={{gridArea:'tt'}}><span>{this.props.title}</span></div>

                <div className={'pages--box'} style={{gridArea:'pp'}}>
                    <div className={'topic'}><span>Pages</span></div>
                    <div className={'pages'}>
                        {this.pagesHandler()}
                    </div>
                    <div className={'add--page'} onClick={() => this.addNewPage()}>
                        <span className={'topic'}>Add new page</span>
                        <span className={'add'}>+</span>
                    </div>
                    <div className={'add--field--hint'} style={{ fontSize: '12px', color: '#666', marginTop: '5px', textAlign: 'center' }}>
                        💡 To add fields to current page, use the buttons in the form area
                    </div>
                    <div className={'register--form'} onClick={() => this.registerForm()}>
                        <span className={'topic'}>{this.props.create_or_edit === 'edit' ? 'Update' : 'Register'}</span>
                    </div>
                </div>

                <div className={'content--box'} style={{gridArea:'cc'}}>
                    {this.contentHandler()}
                </div>

                {/*<div className={'modal'} style={{display:this.state.modalShow? 'flex':'none'}}>*/}
                {/*    <div className={'control'}>*/}
                {/*        <img src={backIcon} onClick={() => this.closeModal()}/>*/}
                {/*    </div>*/}
                {/*    {this.modalContentHandler()}*/}
                {/*</div>*/}
                <ToastContainer />
            </div>
        )
    }
}

export default CreateNewForm;