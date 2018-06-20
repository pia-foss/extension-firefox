import Checkbox from '../checkbox';

export default function(renderer, app, window, document) {
  const React = renderer.react;
  const {bypasslist} = app.util;

  return class PopularRule extends React.Component {
    constructor(props) {
      super(props);
      this.state = {name: props.name, checked: bypasslist.isRuleEnabled(props.name)};
    }

    render() {
      const {checked, name} = this.state
      return (
        <li style={{padding: "5px"}} className="list-group-item col-xs-4 popular-rule">
          <label
              style={{textTransform: "capitalize"}}
              htmlFor={name}
              className="noselect col-xs-8">
            {name}
          </label>
            <Checkbox
              className="col-xs-2"
              checked={checked}
              id={name}
            />
        </li>
      );
    }

    toggleCheckbox(event) {
      const {target} = event;
      const name = target.getAttribute("id");
      if(target.checked) { bypasslist.enablePopularRule(name); }
      else { bypasslist.disablePopularRule(name); }
      this.setState({checked: bypasslist.isRuleEnabled(this.state.name)});
    }
  }
}
