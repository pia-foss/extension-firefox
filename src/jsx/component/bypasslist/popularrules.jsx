import initPopularRule from "component/bypasslist/popularrule"

export default function(renderer, app, window, document) {
  const React = renderer.react;
  const {bypasslist} = app.util;
  const PopularRule = initPopularRule(renderer, app, window, document);

  return class extends React.Component {
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
                return (<PopularRule name={name}/>);
              })}
            </div>
          </div>
        </div>
      );
    }
  }
}
