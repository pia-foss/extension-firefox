import initCheckboxField from 'component/checkboxfield'

export default function(renderer, app) {
  const React         = renderer.react,
        storage       = app.util.storage,
        user          = app.util.user,
        CheckboxField = initCheckboxField(renderer, app)

  class RememberMeField extends CheckboxField {
    onChange(e) {
      if(e.target.checked) {
        this.setState({isChecked: true});
      }
      else {
        this.setState({isChecked: false});
      }
      user.setRememberMe(e.target.checked);
    }
  }

  return RememberMeField
}
