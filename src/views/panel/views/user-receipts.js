import React from "react"
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  UncontrolledDropdown,
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Collapse,
  Button
} from "reactstrap"
import axios from "axios"
import { ContextLayout } from "../../../utility/context/Layout"
import { AgGridReact } from "ag-grid-react"
import {
  Edit,
  Trash2,
  ChevronDown,
  Clipboard,
  Printer,
  Download,
  RotateCw,
  X
} from "react-feather"
import classnames from "classnames"
import { history } from "../../../history"
import "../../../assets/scss/plugins/tables/_agGridStyleOverride.scss"
import "../../../assets/scss/pages/users.scss"
import Breadcrumbs from "../../../components/@vuexy/breadCrumbs/BreadCrumb"
import {constants, messages, WebClient} from '../../../utility/webclient'
import DeleteAlert from './sweet-alert.js'
import { ToastContainer } from "react-toastify"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../assets/scss/plugins/extensions/toastr.scss"
import HelpForms from './help-forms/index'
import Spinner from "../../../components/@vuexy/spinner/in-page-spinner"
import { Formik, Field, Form } from "formik"
import * as Yup from "yup"
import IE from './invalid-tooltip'
import CLabel from './clabel'
import CToggle from './ctoggle'
import Flatpickr from "react-flatpickr";
import { Turkish } from 'flatpickr/dist/l10n/tr'
import "flatpickr/dist/themes/light.css";
import "../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss"
import Select from 'react-select'
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import DataTable from 'react-data-table-component';
import { customStyles } from './_datatable-styles'

import moment from 'moment'
import "moment/locale/tr"
import SunEditor from "suneditor-react";
import ImageFileUpload from "./image-file-upload";
import Textarea from "../../forms/form-elements/textarea/Textarea";
moment.locale("tr")

let columns = []

const formSchema = Yup.object().shape({
  title: Yup.string().required("Bu alan?? bo?? b??rakmay??n"),
  message: Yup.string().required("Bu alan?? bo?? b??rakmay??n"),
  target_type: Yup.string().required("Bu alan?? bo?? b??rakmay??n"),
  target_url: Yup.string().test("match", "Bu alan?? bo?? b??rakmay??n", function(value) {
    if (this.parent.target_type === "1" && value === undefined) {
      return false
    } else {
      return true
    }
  }),
})

class UserReceipts extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        finished: false,
        form_page: false,
        item: {},
        list: [],
        playerCount: 0,
        isGroupamaCustomer: false,
        isLastGame: false,
        user_ids: [],
        store_ids: [],
        receipt_date: {
          start: 0,
          end: 0
        },
        status: 'all',
        users: [],
        stores: [],
      }
    }

    componentDidMount() {
        this._getResources();
        this.checkFilter();
    }

    async checkFilter() {
      const { user_ids, store_ids, receipt_date, status } = this.state

      let c = new WebClient();
      await c.post("get-receipt-list.json", {
          user_ids,
          store_ids,
          receipt_date,
          status
      })
      .then(({status, message, data}) => {
          if (status) {
              columns = [
                  {
                      name: "Kullan??c??",
                      selector: "user_fullname",
                      sortable: true,
                      // cell: params => {
                      //     const _user = this.state.users.filter(v => v.value == params.user_id);
                      //     console.clear();
                      //     console.log(params);
                      //     console.log(_user);
                      //     if (_user[0] !== undefined) {
                      //         return _user[0]?.label;
                      //     }else if (_user?.hasOwnProperty('label')){
                      //         return _user?.label;
                      //     }else{
                      //         return "-";
                      //     }
                      // }
                  },
                  {
                      name: "Ma??aza",
                      selector: "store_title",
                      sortable: true,
                      // cell: params => {
                      //     const _store = this.state.stores.filter(v => v.value.toString() == params.store_id.toString());
                      //     if (_store[0] !== undefined) {
                      //         return _store[0]?.label;
                      //     }else if (_store?.hasOwnProperty('label')){
                      //         return _store?.label;
                      //     }else{
                      //         return "-";
                      //     }
                      // }
                  },
                  {
                      name: "Tutar",
                      selector: "amount",
                      sortable: true
                  },
                  {
                      name: "Tarih",
                      selector: "receipt_date",
                      sortable: true,
                      cell: params => {
                          return this._dateFormat(new Date(params.receipt_date))
                      }
                  },
                  {
                      name: "Durum",
                      selector: "status",
                      sortable: true,
                      cell: params => {
                          switch (params.status) {
                              case 0:
                                  return 'Beklemede';
                                  break;
                              case 1:
                                  return 'Onayland??';
                                  break;
                              case 2:
                                  return 'Red Edildi';
                                  break;
                              case 3:
                                  return 'De??i??iklik Bekleniyor';
                                  break;
                          }
                      }
                  },
                  {
                      name: "????lem",
                      selector: "id",
                      center: true,
                      width: "120px",
                      cell: params => {
                          return (
                              <Button.Ripple
                                  className="rounded-circle btn-icon"
                                  onClick={() => { this.setState({form_page: true, item: params}) }}
                                  color="flat-success"
                              >
                                  <Edit />
                              </Button.Ripple>
                          )
                      }
                  },
              ];
              this.setState({finished: true, form_page: false, list: data})
          }
      })
    } 

    _getResources() {
        let c = new WebClient();
        c.post("get-select-resources.json", {
            user: true,
            store: true
        })
        .then(({status, message, data}) => {
            if (status) {
                this.setState({users: data.users, stores: data.stores})
            }
        })
    }

    _dateFormat(date) {
        var strArray=['Ocak', '??ubat', 'Mart', 'Nisan', 'May??s', 'Haziran', 'Temmuz', 'A??ustos', 'Eyl??l', 'Ekim', 'Kas??m', 'Aral??k'];
        var d = date.getDate();
        var m = strArray[date.getMonth()];
        var y = date.getFullYear();
        return '' + (d <= 9 ? '0' + d : d) + ' ' + m + ' ' + y;
    }

    render() {
      const { user_ids, store_ids, receipt_date, status, list, users, stores, form_page, item } = this.state;
      if(!form_page){
          return (
              <Row className="app-receipt-list">
                  <Col sm="12">
                      <Breadcrumbs
                          marginBottom="mb-2"
                          breadCrumbTitle="M????teri Fi??leri"
                          breadCrumbParent="Kampanya"
                          breadCrumbActive="M????teri Fi??leri"
                      />
                  </Col>

                  <Col sm="12">
                      <Card>
                          <CardHeader>
                              <CardTitle>Filtre</CardTitle>
                          </CardHeader>

                          <CardBody>
                              <Row>
                                  <Col md="3" sm="12">
                                      <FormGroup className="mb-0">
                                          <Label for="status">Durum</Label>
                                          <Input
                                              type="select"
                                              name="status"
                                              id="status"
                                              value={this.state.status}
                                              onChange={e => {
                                                  this.setState({status: e.target.value}, () => { this.checkFilter() })
                                              }}
                                          >
                                              <option value="all">T??m??</option>
                                              <option value="0">Bekleyen</option>
                                              <option value="1">Onayland??</option>
                                              <option value="2">Red Edildi</option>
                                              <option value="3">De??i??iklik Bekleyen</option>
                                          </Input>
                                      </FormGroup>
                                  </Col>

                                  <Col md="3" sm="12">
                                      <FormGroup className="mb-0">
                                          <Label for="receipt_date">Harcama Tarihi</Label>
                                          <Flatpickr
                                              className="form-control"
                                              name="receipt_date"
                                              id="receipt_date"
                                              placeholder="Harcama Tarihi"
                                              options={{
                                                  locale: Turkish,
                                                  dateFormat: 'd-m-Y',
                                                  mode: 'range'
                                              }}
                                              onChange={date => {
                                                  if (date.length > 1) {
                                                      let start = moment(date[0]).format('x') / 1000
                                                      let end = moment(date[1]).format('x') / 1000
                                                      let a = this.state.receipt_date
                                                      a.start = start;
                                                      a.end = end;
                                                      this.setState({receipt_date: a}, () => { this.checkFilter() })
                                                  }
                                              }}
                                          />
                                      </FormGroup>
                                  </Col>

                                  <Col md="3" sm="12">
                                      <FormGroup>
                                          <CLabel required for="user_ids">M????teri</CLabel>
                                          <Select
                                              name="user_ids"
                                              id="user_ids"
                                              menuPortalTarget={document.body}
                                              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                              className={`form-control no-padding`}
                                              classNamePrefix="select"
                                              placeholder="Se??iniz..."
                                              isMulti={true}
                                              onChange={(e) => {
                                                  this.setState({user_ids: e ?? []}, () => { this.checkFilter() })
                                              }}
                                              value={this.state.user_ids}
                                              options={users}
                                          />
                                      </FormGroup>
                                  </Col>

                                  <Col md="3" sm="12">
                                      <FormGroup>
                                          <CLabel required for="store_ids">Ma??aza</CLabel>
                                          <Select
                                              name="store_ids"
                                              id="store_ids"
                                              menuPortalTarget={document.body}
                                              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                              className={`form-control no-padding`}
                                              classNamePrefix="select"
                                              placeholder="Se??iniz..."
                                              isMulti={true}
                                              onChange={(e) => {
                                                  this.setState({store_ids: e ?? []}, () => { this.checkFilter() })
                                              }}
                                              value={this.state.store_ids}
                                              options={stores}
                                          />
                                      </FormGroup>
                                  </Col>
                              </Row>
                              <Row>
                                  <Col md="12">
                                      <p>Bu kriterlere uyan {list.length} adet kullan??c?? bulundu.</p>
                                  </Col>
                              </Row>
                          </CardBody>
                      </Card>
                  </Col>

                  <Col sm="12">
                      <Card>
                          <CardBody>
                              <DataTable
                                  columns={columns}
                                  title={""}
                                  customStyles={customStyles}
                                  pagination
                                  data={list}
                                  striped={true}
                                  noHeader={true}
                                  highlightOnHover
                              />
                          </CardBody>
                      </Card>
                  </Col>

                  {
                      this.state.showAlert ?
                          <DeleteAlert
                              message="Se??ti??iniz kay??t silinecektir. Devam etmek istiyor musunuz?"
                              confirmButtonText="Evet"
                              onConfirm={() => { this._delete() }}
                              onClose={() => { this.setState({showAlert: false, deletedItemID: 0}) }} />
                          :
                          null
                  }

              </Row>
          );
      }else{
          return (
              <Row className="app-receipt-list">
                  <Col sm="12">
                      <Breadcrumbs
                          marginBottom="mb-2"
                          breadCrumbTitle="M????teri Fi??leri"
                          breadCrumbParent="Kampanya"
                          breadCrumbActive="{item.user_id}"
                          showCancelButton={true}
                          onCancelButtonClick={() => { this.setState({form_page: false, item: {}}) }}
                      />
                  </Col>

                  <Col lg="12" md="12">
                      <Card>
                          <CardBody>
                              <Formik
                                  enableReinitialize={true}
                                  innerRef={(e) => { this.formik = e }}
                                  initialValues={item}
                                  validationSchema={
                                      Yup.object().shape({
                                          status: Yup.number().integer().required("L??tfen durum belirtiniz")
                                      })
                                  }
                                  onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {
                                      let c = new WebClient();
                                      c.post("edit-receipt.json", values)
                                          .then(({status, message, data}) => {
                                              if (status) {
                                                  toast.success(message)
                                                  this.checkFilter();
                                              } else {
                                                  toast.error(message)
                                              }
                                              setSubmitting(false);
                                          })
                                          .catch((error) => {
                                              setSubmitting(false)
                                              toast.error("Beklenmeyen bir hata olu??tu. L??tfen sayfay?? yenileyerek tekrar deneyin")
                                          })

                                  }}
                              >
                                  {({ errors, touched, values, isSubmitting, handleChange, handleBlur, setFieldValue }) => (
                                      <Form noValidate={true} autoComplete="off">
                                          <Row>

                                              <Col sm="12" md="4">
                                                  <FormGroup>
                                                      <CLabel required for="M????teri">M????teri</CLabel>
                                                      <Field
                                                          placeholder="M????teri"
                                                          name="user_id"
                                                          id="user_id"
                                                          value={values.user_fullname}
                                                          className={`form-control ${errors.user_id && touched.user_id && "is-invalid"}`}
                                                          readOnly={true}
                                                      />
                                                      <IE show={Boolean(errors.user_id && touched.user_id)} message={errors.user_id} />
                                                  </FormGroup>
                                              </Col>

                                              <Col sm="12" md="4">
                                                  <FormGroup>
                                                      <CLabel required for="store_id">Ma??aza Ad??</CLabel>
                                                      <Field
                                                          placeholder="Ma??aza"
                                                          name="store_id"
                                                          id="store_id"
                                                          value={values.store_title}
                                                          className={`form-control ${errors.store_id && touched.store_id && "is-invalid"}`}
                                                          readOnly={true}
                                                      />
                                                      <IE show={Boolean(errors.store_id && touched.store_id)} message={errors.store_id} />
                                                  </FormGroup>
                                              </Col>

                                              <Col sm="12" md="4">
                                                  <FormGroup>
                                                      <CLabel required for="receipt_date">Harcama Tarihi</CLabel>
                                                      <Field
                                                          placeholder="Harcama Tarihi"
                                                          name="receipt_date"
                                                          id="receipt_date"
                                                          value={this._dateFormat(new Date(values.receipt_date))}
                                                          className={`form-control ${errors.receipt_date && touched.receipt_date && "is-invalid"}`}
                                                          readOnly={true}
                                                      />
                                                      <IE show={Boolean(errors.receipt_date && touched.receipt_date)} message={errors.receipt_date} />
                                                  </FormGroup>
                                              </Col>

                                              <Col sm="12" md="4">
                                                  <FormGroup>
                                                      <CLabel required for="amount">Tutar</CLabel>
                                                      <Field
                                                          placeholder="Tutar"
                                                          name="amount"
                                                          id="amount"
                                                          value={values.amount}
                                                          className={`form-control ${errors.amount && touched.amount && "is-invalid"}`}
                                                          readOnly={true}
                                                      />
                                                      <IE show={Boolean(errors.amount && touched.amount)} message={errors.amount} />
                                                  </FormGroup>
                                              </Col>

                                              <Col sm="12" md="4">
                                                  <FormGroup>
                                                      <CLabel required for="comission_rate">Komisyon Oran??</CLabel>
                                                      <Field
                                                          placeholder="Komisyon Oran??"
                                                          name="comission_rate"
                                                          id="comission_rate"
                                                          value={values.comission_rate}
                                                          className={`form-control ${errors.comission_rate && touched.comission_rate && "is-invalid"}`}
                                                          onChange={e => {
                                                              setFieldValue('comission_rate', e.target.value);
                                                              setFieldValue('gain', (parseFloat(e.target.value) * parseFloat(values.amount))/100);
                                                          }}
                                                      />
                                                      <IE show={Boolean(errors.comission_rate && touched.comission_rate)} message={errors.comission_rate} />
                                                  </FormGroup>
                                              </Col>

                                              <Col sm="12" md="4">
                                                  <FormGroup>
                                                      <CLabel required for="gain">Puan Miktar??</CLabel>
                                                      <Field
                                                          placeholder="Puan Miktar??"
                                                          name="gain"
                                                          id="gain"
                                                          value={values.gain}
                                                          className={`form-control ${errors.gain && touched.gain && "is-invalid"}`}
                                                          readOnly={true}
                                                      />
                                                      <IE show={Boolean(errors.gain && touched.gain)} message={errors.gain} />
                                                  </FormGroup>
                                              </Col>

                                              <Col sm="12" md="8">
                                                  <FormGroup>
                                                      <CLabel required for="description">A????klama</CLabel>
                                                      <Input
                                                          type={"textarea"}
                                                          placeholder="A????klama"
                                                          name="description"
                                                          id="description"
                                                          value={values.description}
                                                          className={`form-control ${errors.description && touched.description && "is-invalid"}`}
                                                          rows={2}
                                                          onChange={e => {
                                                              setFieldValue('description', e.target.value);
                                                          }}
                                                      />
                                                      <IE show={Boolean(errors.description && touched.description)} message={errors.description} />
                                                  </FormGroup>
                                              </Col>

                                              <Col md="4" sm="12">
                                                  <FormGroup className="mb-0">
                                                      <Label for="status">Durum</Label>
                                                      <Input
                                                          type="select"
                                                          name="status"
                                                          id="status"
                                                          value={values.status}
                                                          onChange={e => {
                                                              setFieldValue('status', e.target.value);
                                                          }}
                                                      >
                                                          <option value="all">T??m??</option>
                                                          <option value="0">Bekleyen</option>
                                                          <option value="1">Onayland??</option>
                                                          <option value="2">Red Edildi</option>
                                                          <option value="3">De??i??iklik Bekleyen</option>
                                                      </Input>
                                                  </FormGroup>
                                              </Col>

                                              <Col sm="12">
                                                  <FormGroup>
                                                      <Button.Ripple
                                                          color="primary"
                                                          type="submit"
                                                          className="mr-1 mb-1"
                                                      >
                                                          Kaydet
                                                      </Button.Ripple>
                                                  </FormGroup>
                                              </Col>

                                              {
                                                  item != null && item?.image?.length > 0 && (
                                                      <Col sm="12" md="12">
                                                          <h6>Fi?? Foto??raf??</h6>
                                                          <img className="mb-2" src={constants.base_img + item.image} style={{ height: "auto" }} />
                                                      </Col>
                                                  )
                                              }

                                          </Row>
                                      </Form>
                                  )}
                              </Formik>
                          </CardBody>
                      </Card>
                  </Col>

                  {
                      this.state.showAlert ?
                          <DeleteAlert
                              message="Se??ti??iniz kay??t silinecektir. Devam etmek istiyor musunuz?"
                              confirmButtonText="Evet"
                              onConfirm={() => { this._delete() }}
                              onClose={() => { this.setState({showAlert: false, deletedItemID: 0}) }} />
                          :
                          null
                  }

              </Row>
          );
      }
    }
}

export default UserReceipts
