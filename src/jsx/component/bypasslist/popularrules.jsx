import PopularRule from 'component/bypasslist/popularrule';

export default function(renderer, app, window, document) {
  const React = renderer.react;
  const {bypasslist} = app.util;

  return class PopularRules extends React.Component {
    constructor(props) {
      super(props);
      this.state = {popularRulesByName: bypasslist.popularRulesByName()};
    }

    render() {
      const {popularRulesByName} = this.state;
      return (
        <div>
          <h3 className="bl_sectionheader">{t("PopularWebsites")}</h3>
          <div className="popular">
            <div>
              {popularRulesByName.map((name, i) => {
                return (<PopularRule defaultName={name} key={name} app={app}/>);
              })}
            </div>
          </div>
        </div>
      );
    }
  }
}
