import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { isEmpty, cloneDeep } from 'lodash';
import { push } from 'react-router-redux';
import ShareEntity from '../components/modals/ShareEntity';
import * as actions from '../actions/dashboard';
import { fetchLibrary } from '../actions/library';
import { fetchDataset } from '../actions/dataset';

const getEditingStatus = location => {
  const testString = 'create';

  return location.pathname.indexOf(testString) === -1;
};

const getLayoutObjectFromArray = arr => {
  const object = {};

  arr.forEach(item => {
    const key = item.i;

    object[key] = item;
  });

  return object;
};

/* Get a pure representation of a dashboard from the container state */
const getDashboardFromState = (state, isForEditor) => (
  cloneDeep(
    {
      type: state.type,
      title: state.name,
      /* Temporary shim until we standardize on "name" or "title" for entities */
      name: state.name,
      entities: state.entities,
      /* The editor takes an array for layout, but for storage we use an id-keyed object */
      layout: isForEditor ? state.layout : getLayoutObjectFromArray(state.layout),
      id: state.id,
      created: state.created,
      modified: state.modified,
    }
  )
);

class Dashboard extends Component {

  constructor() {
    super();
    this.state = {
      type: 'dashboard',
      name: '',
      entities: {},
      layout: [],
      id: null,
      created: null,
      modified: null,
      isUnsavedChanges: null,
      isShareModalVisible: false,
      requestedDatasetIds: [],
      asyncComponents: null,
    };
    this.loadDashboardIntoState = this.loadDashboardIntoState.bind(this);
    this.onAddVisualisation = this.onAddVisualisation.bind(this);
    this.updateLayout = this.updateLayout.bind(this);
    this.updateEntities = this.updateEntities.bind(this);
    this.onUpdateName = this.onUpdateName.bind(this);
    this.onSave = this.onSave.bind(this);
    this.toggleShareDashboard = this.toggleShareDashboard.bind(this);
    this.handleDashboardAction = this.handleDashboardAction.bind(this);
  }

  componentWillMount() {
    const isEditingExistingDashboard = getEditingStatus(this.props.location);
    const isLibraryLoaded = !isEmpty(this.props.library.datasets);

    if (!isLibraryLoaded) {
      this.props.dispatch(fetchLibrary());
    }

    if (isEditingExistingDashboard) {
      const dashboardId = this.props.params.dashboardId;
      const existingDashboardLoaded =
        isLibraryLoaded && !isEmpty(this.props.library.dashboards[dashboardId].layout);

      if (!existingDashboardLoaded) {
        this.props.dispatch(actions.fetchDashboard(dashboardId));
      } else {
        this.loadDashboardIntoState(this.props.library.dashboards[dashboardId], this.props.library);
      }
    }
  }

  componentDidMount() {
    require.ensure(['../components/charts/DashChart'], () => {
      require.ensure([], () => {
        /* eslint-disable global-require */
        const DashboardEditor = require('../components/dashboard/DashboardEditor').default;
        const DashboardHeader = require('../components/dashboard/DashboardHeader').default;
        /* eslint-enable global-require */

        this.setState({
          asyncComponents: {
            DashboardEditor,
            DashboardHeader,
          },
        });
      }, 'Dashboard');
    }, 'DashChartPreload');
  }

  componentWillReceiveProps(nextProps) {
    const isEditingExistingDashboard = getEditingStatus(this.props.location);
    const dashboardAlreadyLoaded = this.state.layout.length !== 0;

    if (isEditingExistingDashboard && !dashboardAlreadyLoaded) {
      /* We need to load a dashboard, and we haven't loaded it yet. Check if nextProps has both i)
      /* the dashboard and ii) the visualisations the dashboard contains, then load the dashboard
      /* editor if both these conditions are true. */

      const dash = nextProps.library.dashboards[nextProps.params.dashboardId];
      const haveDashboardData = Boolean(dash && dash.layout);

      if (haveDashboardData) {
        const dashboardEntities = Object.keys(dash.entities).map(key => dash.entities[key]);
        const dashboardHasVisualisations =
          dashboardEntities.some(entity => entity.type === 'visualisation');
        const libraryHasVisualisations = !isEmpty(nextProps.library.visualisations);

        if (dashboardHasVisualisations && !libraryHasVisualisations) {
          /* We don't yet have the visualisations necessary to display this dashboard. Do nothing.
          /* When the library API call returns and the visualisaitons are loaded,
          /* componentWillReceiveProps will be called again. */
          return;
        }

        this.loadDashboardIntoState(dash, nextProps.library);
      }
    }
  }

  onSave() {
    const { dispatch } = this.props;
    const dashboard = getDashboardFromState(this.state, false);
    const isEditingExistingDashboard = getEditingStatus(this.props.location);

    if (isEditingExistingDashboard) {
      dispatch(actions.saveDashboardChanges(dashboard));
    } else {
      dispatch(actions.createDashboard(dashboard));
    }
    dispatch(push('/library?filter=dashboards&sort=created'));
  }

  onAddVisualisation(datasetId) {
    const datasetLoaded = this.props.library.datasets[datasetId].columns;
    const datasetRequested = this.state.requestedDatasetIds.some(id => id === datasetId);

    if (!datasetLoaded && !datasetRequested) {
      const newRequestedDatasetIds = this.state.requestedDatasetIds.slice(0);

      newRequestedDatasetIds.push(datasetId);
      this.setState({
        requestedDatasetIds: newRequestedDatasetIds,
      });
      this.props.dispatch(fetchDataset(datasetId));
    }
  }

  onUpdateName(name) {
    this.setState({ name });
  }

  updateLayout(layout) {
    this.setState({ layout });
  }

  updateEntities(entities) {
    this.setState({ entities });
  }

  handleDashboardAction(action) {
    switch (action) {
      case 'share':
        this.toggleShareDashboard();
        break;
      default:
        throw new Error(`Action ${action} not yet implemented`);
    }
  }

  toggleShareDashboard() {
    this.setState({
      isShareModalVisible: !this.state.isShareModalVisible,
    });
  }

  loadDashboardIntoState(dash, library) {
    /* Put the dashboard into component state so it is fed to the DashboardEditor */
    this.setState({
      id: dash.id,
      name: dash.title,
      entities: dash.entities,
      layout: Object.keys(dash.layout).map(key => dash.layout[key]),
      created: dash.created,
      modified: dash.modified,
    });

    /* Load each unique dataset referenced by visualisations in the dashboard. Note - Even though
    /* onAddVisualisation also checks to see if a datasetId has already been requested, setState is
    /* not synchronous and is too slow here, hence the extra check */
    const requestedDatasetIds = this.state.requestedDatasetIds.slice(0);

    Object.keys(dash.entities).forEach(key => {
      const entity = dash.entities[key];
      const isVisualisation = entity.type === 'visualisation';

      if (isVisualisation) {
        const datasetId = library.visualisations[key].datasetId;
        const alreadyProcessed = requestedDatasetIds.some(id => id === datasetId);

        if (!alreadyProcessed) {
          requestedDatasetIds.push(datasetId);
          this.onAddVisualisation(datasetId);
        }
      }
    });
  }

  render() {
    if (!this.state.asyncComponents) {
      return <div>Loading...</div>;
    }
    const { DashboardHeader, DashboardEditor } = this.state.asyncComponents;
    return (
      <div className="Dashboard">
        <DashboardHeader
          dashboard={getDashboardFromState(this.state, false)}
          isUnsavedChanges={this.state.isUnsavedChanges}
          onDashboardAction={this.handleDashboardAction}
        />
        <DashboardEditor
          dashboard={getDashboardFromState(this.state, true)}
          datasets={this.props.library.datasets}
          visualisations={this.props.library.visualisations}
          onAddVisualisation={this.onAddVisualisation}
          onSave={this.onSave}
          onUpdateLayout={this.updateLayout}
          onUpdateEntities={this.updateEntities}
          onUpdateName={this.onUpdateName}
        />
        <ShareEntity
          isOpen={this.state.isShareModalVisible}
          onClose={this.toggleShareDashboard}
          entity={getDashboardFromState(this.state, false)}
        />
      </div>
    );
  }
}

Dashboard.propTypes = {
  dispatch: PropTypes.func.isRequired,
  library: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  params: PropTypes.object,
};

export default connect(state => state)(Dashboard);
