import React, { Component, PropTypes } from 'react';

export default class LinkDataSourceSettings extends Component {

  static isValidSource(source) {
    return (
      source.kind === 'LINK' &&
      source.url
    );
  }

  constructor() {
    super();
    this.handleLink = this.handleLink.bind(this);
  }

  handleLink(evt) {
    const url = evt.target.value.trim();
    this.props.onChange({
      kind: 'LINK',
      url,
    });
  }

  render() {
    return (
      <div className="LinkFileSelection">
        <div>
          <label
            className="linkFileInputLabel"
            htmlFor="linkFileInput"
          >
              Link:
          </label>
          <input
            className="linkFileInput"
            id="linkFileInput"
            type="text"
            placeholder="Paste url here"
            defaultValue={this.props.dataSource.url}
            onChange={this.handleLink}
          />
        </div>
        <div>
          <label
            className="linkFileToggleLabel"
            htmlFor="dataHasColumnHeadersCheckbox"
          >
            Data has column headers:
          </label>
          <input
            id="dataHasColumnHeadersCheckbox"
            type="checkbox"
            defaultChecked={this.props.dataSource.hasColumnHeaders}
            ref={ref => { this.datasetHeaderStatusToggle = ref; }}
            onClick={() => {
              this.props.onChange({
                hasColumnHeaders: this.datasetHeaderStatusToggle.checked,
              });
            }}
          />
        </div>
      </div>
    );
  }
}

LinkDataSourceSettings.propTypes = {
  onChange: PropTypes.func.isRequired,
  dataSource: PropTypes.shape({
    kind: PropTypes.oneOf(['LINK']).isRequired,
    url: PropTypes.string.isRequired,
    hasColumnHeaders: PropTypes.bool.isRequired,
  }),
};
