import React, { Component, PropTypes } from 'react';
import * as tus from 'tus-js-client';
import keycloak from '../../../auth';
import DashProgressBar from '../../common/DashProgressBar';

export default class DataFileDataSourceSettings extends Component {

  static isValidSource(source) {
    return (
      source.kind === 'DATA_FILE' &&
      source.url &&
      source.fileName
    );
  }

  constructor() {
    super();
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleProgress = this.handleProgress.bind(this);
    this.state = { uploadProgressPercentage: null };
  }

  isProgressBarVisible() {
    return this.state.uploadProgressPercentage !== null;
  }

  handleDragEnter(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }

  handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
  }

  handleDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    this.uploadFile(evt.dataTransfer.files[0]);
  }

  handleProgress(percentage) {
    this.setState({ uploadProgressPercentage: percentage });
  }

  uploadFile(file) {
    const onChange = this.props.onChange;
    const updateUploadStatus = this.props.updateUploadStatus;
    const handleProgress = this.handleProgress;
    const upload = new tus.Upload(file, {
      headers: { Authorization: `Bearer ${keycloak.token}` },
      endpoint: '/api/files',
      onError(error) {
        console.error(`Failed because: ${error}`);
        updateUploadStatus(false);
        handleProgress(-1);
      },
      onProgress(bytesUploaded, bytesTotal) {
        const percentage = parseFloat(((bytesUploaded / bytesTotal) * 100).toFixed(2));
        handleProgress(percentage);
      },
      onSuccess() {
        updateUploadStatus(false);
        onChange({
          kind: 'DATA_FILE',
          url: upload.url,
          fileName: upload.file.name,
        });
      },
    });
    upload.start();
    handleProgress(0);
    updateUploadStatus(true);
  }

  render() {
    return (
      <div
        className="DataFileFileSelection"
        onDragEnter={this.handleDragEnter}
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
      >
        <p className="dataFileUploadMessage">Drop file anywhere to upload</p>
        <p className="dataFileUploadMessage">or</p>
        <input
          className={`dataFileUploadInput${this.isProgressBarVisible() ? ' progressActive' : ''}`}
          ref={ref => { this.fileInput = ref; }}
          type="file"
          onChange={() => {
            this.uploadFile(this.fileInput.files[0]);
          }}
        />
        <p className="dataFileUploadHeaderToggle">
          File has column headers:
          <input
            type="checkbox"
            className="datasetHeaderStatusToggle"
            defaultChecked={this.props.dataSource.hasColumnHeaders}
            ref={ref => { this.datasetHeaderStatusToggle = ref; }}
            onClick={() => {
              this.props.onChange({
                hasColumnHeaders: this.datasetHeaderStatusToggle.checked,
              });
            }
            }
          />
        </p>
        {this.isProgressBarVisible() &&
          <div>
            <DashProgressBar
              progressPercentage={this.state.uploadProgressPercentage}
              errorText="Error"
              completionText="Success"
            />
            {this.state.uploadProgressPercentage === -1 &&
              <span className="errorText">
                CSV file upload failed. Please try again.
              </span>
            }
          </div>
        }
      </div>
    );
  }
}

DataFileDataSourceSettings.propTypes = {
  dataSource: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  updateUploadStatus: PropTypes.func.isRequired,
};
