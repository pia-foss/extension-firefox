import initCompanyLogo from 'component/companylogo'

export default function(renderer, app, window, document) {
  const React = renderer.react,
        CompanyLogo = initCompanyLogo(renderer, app, window, document)

  class ChromeUpgradeTemplate extends React.Component {
    closeWindow() {
      browser.windows.remove(browser.windows.WINDOW_ID_CURRENT);
    }

    render() {
      return (
        <div>
          <CompanyLogo/>
          <div className="top-border">
            <div className="warningicon"></div>
            <p className="warningtext">
              {t("UpgradeBrowserMessage", {browser: app.buildinfo.browser})}
            </p>
            <p className="btn-center">
              <a className="btn btn-success" href="#" onClick={this.closeWindow.bind(this)}>{t("CloseText")}</a>
            </p>
          </div>
        </div>
      )
    }
  }

  return ChromeUpgradeTemplate
}
