// Spanish messages for the browser's own form validation. Without them the
// bubble speaks the browser's language, and on a phone "Please fill out this
// field" or a bare red outline was the only hint of what went wrong.
//
//   <input required onInvalid={explainInvalid} onInput={clearInvalid} />
export const explainInvalid = (event) => {
    const { validity } = event.target;
    let message = '';
    if (validity.valueMissing) message = 'Este campo es obligatorio.';
    else if (validity.typeMismatch) message = 'Revise el email: debe tener la forma nombre@dominio.com.';
    event.target.setCustomValidity(message);
};

export const clearInvalid = (event) => event.target.setCustomValidity('');
