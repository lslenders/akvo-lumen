import React, { Component, PropTypes } from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { showModal } from '../actions/activeModal';
import { getId, getTitle } from '../domain/entity';
import { getTransformations, getRows, getColumns } from '../domain/dataset';
import * as api from '../api';

require('../styles/Dataset.scss');

class Dataset extends Component {

  constructor() {
    super();
    this.state = {
      asyncComponents: null,
      dataset: null,
      pendingTransformations: Immutable.List(),
    };
    this.handleShowDatasetSettings = this.handleShowDatasetSettings.bind(this);
    this.fetchDataset = this.fetchDataset.bind(this);
    this.transform = this.transform.bind(this);
    this.undo = this.undo.bind(this);
  }

  componentDidMount() {
    const { params } = this.props;
    const { datasetId } = params;

    this.fetchDataset(datasetId);

    require.ensure([], () => {
      /* eslint-disable global-require */
      const DatasetHeader = require('../components/dataset/DatasetHeader').default;
      const DatasetTable = require('../components/dataset/DatasetTable').default;
      /* eslint-enable global-require */

      this.setState({
        asyncComponents: {
          DatasetHeader,
          DatasetTable,
        },
      });
    }, 'Dataset');
  }

  fetchDataset(datasetId) {
    api.get(`/api/datasets/${datasetId}`)
      .then((dataset) => this.setState({ dataset: Immutable.fromJS(dataset) }));
  }

  transform(transformation) {
    const { dataset, pendingTransformations } = this.state;
    const id = dataset.get('id');
    this.setState({ pendingTransformations: pendingTransformations.push(transformation) });
    api.post(`/api/transformations/${id}/transform`, transformation.toJS())
      .then(() => {
        this.setState({ pendingTransformations: pendingTransformations.shift() });
        this.fetchDataset(id);
      });
  }

  undo() {
    const { dataset } = this.state;
    const id = dataset.get('id');

    api.post(`/api/transformations/${id}/undo`)
      .then(() => this.fetchDataset(id));
  }

  handleShowDatasetSettings() {
    this.props.dispatch(showModal('dataset-settings', {
      id: getId(this.state.dataset),
    }));
  }

  render() {
    const { dataset } = this.state;
    if (dataset == null || !this.state.asyncComponents) {
      return <div className="Dataset">Loading...</div>;
    }
    const { DatasetHeader, DatasetTable } = this.state.asyncComponents;

    return (
      <div className="Dataset">
        <DatasetHeader
          onShowDatasetSettings={this.handleShowDatasetSettings}
          name={getTitle(dataset)}
          id={getId(dataset)}
        />
        {getRows(dataset) != null &&
          <DatasetTable
            columns={getColumns(dataset)}
            rows={getRows(dataset)}
            transformations={getTransformations(dataset)}
            onTransform={transformation => this.transform(transformation)}
            onUndoTransformation={() => this.undo()}
          />}
      </div>
    );
  }
}

Dataset.propTypes = {
  params: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

// Just inject `dispatch`
export default connect(() => ({}))(Dataset);
