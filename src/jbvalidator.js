import {
  formatBytes,
  getFileExtensionsFromMimeTypes,
  isMimeTypeMatching,
} from './helpers';

(function ($) {
  'use strict';

  $.fn.jbvalidator = function (options) {
    let defaults = {
      language: '', //json file url
      errorMessage: true,
      successClass: false,
      html5BrowserDefault: false,
      validFeedBackClass: 'valid-feedback',
      invalidFeedBackClass: 'invalid-feedback',
      validClass: 'is-valid',
      invalidClass: 'is-invalid',
    };

    options = $.extend({}, defaults, options);

    let FORM = this;

    const errorMessages = {
      maxValue: 'La valeur doit être inférieure ou égale à %s.',
      minValue: 'La valeur doit être supérieure ou égale à %s.',
      maxLength:
        'Veuillez réduire le texte à %s caractère(s) ou moins (vous utilisez actuellement %s caractère(s)).',
      minLength:
        'Veuillez saisir %s caractère(s) au minimum (vous utilisez actuellement %s caractère(s)).',
      minSelectOption: 'Veuillez sélectionner %s option(s) au minimum.',
      maxSelectOption: 'Veuillez sélectionner %s option(s) au maximum.',
      groupCheckBox: 'Veuillez sélectionner au moins %s option(s).',
      equal: 'Ce champ ne correspond pas au champ %s.',
      fileMinSize: 'La taille du fichier ne peut être inférieure à %s.',
      fileMaxSize: 'La taille du fichier ne peut être supérieure à %s.',
      fileType: 'Veuillez sélectionner un fichier avec une extension valide%s.',
      number: 'Veuillez entrer un nombre.',
      HTML5: {
        valueMissing: {
          INPUT: {
            default: 'Veuillez remplir ce champ.',
            checkbox: 'Veuillez cocher cette case.',
            radio: "Veuillez sélectionner l'une de ces options.",
            file: 'Veuillez sélectionner un fichier.',
          },
          SELECT: 'Veuillez sélectionner un élément de la liste.',
          TEXTAREA: 'Veuillez remplir ce champ.',
        },
        typeMismatch: {
          email: 'Veuillez saisir une adresse e-mail valide.',
          url: 'Veuillez saisir une URL.',
        },
        rangeUnderflow: {
          date: 'La valeur doit être égale à %s ou postérieure.',
          month: 'La valeur doit être égale à %s ou postérieure.',
          week: 'La valeur doit être égale à %s ou postérieure.',
          time: 'La valeur doit être égale à %s ou postérieure.',
          datetimeLocale: 'La valeur doit être égale à %s ou postérieure.',
          number: 'La valeur doit être supérieure ou égale à %s.',
          range: 'La valeur doit être supérieure ou égale à %s.',
        },
        rangeOverflow: {
          date: 'La valeur doit être égale à %s ou antérieure.',
          month: 'La valeur doit être égale à %s ou antérieure.',
          week: 'La valeur doit être égale à %s ou antérieure.',
          time: 'La valeur doit être égale à %s ou antérieure.',
          datetimeLocale: 'La valeur doit être égale à %s ou antérieure.',
          number: 'La valeur doit être inférieure ou égale à %s.',
          range: 'La valeur doit être inférieure ou égale à %s.',
        },
        stepMismatch: {
          date: "Vous ne pouvez sélectionner qu'un jour tous les %s jour(s) dans le calendrier.",
          month:
            "Vous ne pouvez sélectionner qu'un mois tous les %s mois dans le calendrier",
          week: "Vous ne pouvez sélectionner qu'une semaine tous les %s semaine(s) dans le calendrier",
          time: "Vous ne pouvez sélectionner qu'un mois tous les %s mois dans le calendrier",
          datetimeLocale:
            'Vous devez respecter un pas de %s seconde(s) dans le champ horaire.',
          number:
            'Entrez une valeur valide. Seulement %s ou un multiple de %s.',
          range:
            'Please enter a valid value. Seulement %s ou un multiple de %s.',
        },
        tooLong:
          'Veuillez réduire le texte à %s caractère(s) ou moins (vous utilisez actuellement %s caractère(s)).',
        tooShort:
          'Veuillez saisir %s caractère(s) au minimum (vous utilisez actuellement %s caractère(s)).',
        patternMismatch: 'Veuillez respecter le format attendu. %s',
        badInput: {
          number: 'Veuillez saisir un nombre.',
        },
      },
    };

    const selector = 'input, textarea, select';

    let STATUS = 0;

    /**
     * run validate when form submit
     */
    $(FORM).on('submit', function (event) {
      STATUS = 0;

      checkAll(this, event);

      if (STATUS) {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    let checkAll = function (form, event) {
      let thisForm = form ? form : FORM;
      let thisEvent = event ? event : '';
      STATUS = 0;
      $(thisForm)
        .find(selector)
        .each((i, el) => {
          validationRun(el, thisEvent);
        });

      return STATUS;
    };

    /**
     * run validate when on input
     */
    let run = function () {
      $(FORM)
        .find(selector)
        .each((i, el) => {
          $(el).off('input');
          $(el).on('input', function (event) {
            validationRun(this, event);

            if (hasAttr(el, 'data-v-equal')) {
              let equal = $(el).attr('data-v-equal');
              $(equal).one('input', function () {
                let id = $(this).attr('id');
                $('[data-v-equal="#' + id + '"]').trigger('input');
              });
            }
          });
        });
    };

    let validationRun = function (el, event) {
      el.setCustomValidity('');

      if (el.checkValidity() !== false) {
        Object.values(validator).map((value) => {
          let error = value.call(value, el, event);

          if (error) {
            el.setCustomValidity(error);
          }
        });
      } else {
        if (!options.html5BrowserDefault) {
          el.setCustomValidity(HTML5Default(el));
        }
      }

      if (el.checkValidity() === false && (el.type !== 'file' || !el.dataset.file)) {
        showErrorMessage(el, el.validationMessage);
        STATUS++;
      } else {
        hideErrorMessage(el);
      }
    };

    /**
     * show errors
     * @param el
     * @param message
     */
    let showErrorMessage = function (el, message) {
      $(el).removeClass(options.validClass);
      $(el).addClass(options.invalidClass);

      message = $(el).data('vMessage') ?? message;

      if (options.errorMessage) {
        let group = $(el).parent();

        if ($(group).length) {
          let invalidFeedBack = $(group).find(
            '.' + options.invalidFeedBackClass
          );
          if ($(invalidFeedBack).length) {
            $(invalidFeedBack).html(message);
          } else {
            $(group).append(
              '<div class="' +
                options.invalidFeedBackClass +
                '">' +
                message +
                '</div>'
            );
          }
        }
      }
    };

    let hideErrorMessage = function (el) {
      $(el).removeClass(options.invalidClass);

      if (options.successClass) {
        $(el).addClass(options.validClass);
      }
    };

    let validator = {
      multiSelectMin: function (el) {
        if ($(el).prop('tagName') === 'SELECT' && $(el).prop('multiple')) {
          let mustSelectedCount = $(el).data('vMinSelect');
          let selectedCount = $(el).find('option:selected').length;

          if (
            selectedCount < mustSelectedCount &&
            ($(el).prop('require') || selectedCount > 0)
          ) {
            return errorMessages.minSelectOption.sprintf(mustSelectedCount);
          }
        }
        return '';
      },

      multiSelectMax: function (el) {
        if ($(el).prop('tagName') === 'SELECT' && $(el).prop('multiple')) {
          let mustSelectedCount = $(el).data('vMaxSelect');
          let selectedCount = $(el).find('option:selected').length;

          if (
            selectedCount > mustSelectedCount &&
            ($(el).prop('require') || selectedCount > 0)
          ) {
            return errorMessages.maxSelectOption.sprintf(mustSelectedCount);
          }
        }
        return '';
      },

      equal: function (el) {
        let equal = $(el).data('vEqual');

        if (equal) {
          let title = $(equal).attr('title');

          if ($(equal).val() !== $(el).val()) {
            return errorMessages.equal.sprintf(title ? title : '');
          }
        }
        return '';
      },

      groupCheckBox: function (el, event) {
        if (hasAttr(el, 'type', 'checkbox')) {
          let checkGroup = $(el).closest('[data-checkbox-group]');
          let mustCheckedCount = $(checkGroup).data('vMinSelect');
          let checkedCount = checkGroup.find(
            'input[type=checkbox]:checked'
          ).length;
          let groupRequired =
            typeof $(checkGroup).data('vRequired') === 'undefined' ? 0 : 1;

          if (checkGroup) {
            if (
              typeof event.originalEvent !== 'undefined' &&
              event.originalEvent.type === 'input'
            ) {
              $(checkGroup)
                .find('input[type=checkbox]')
                .each((i, item) => {
                  $(item).trigger('input');
                });
            }

            if (
              checkedCount < mustCheckedCount &&
              (groupRequired || checkedCount > 0)
            ) {
              if ($(el).prop('checked') === false) {
                return errorMessages.groupCheckBox.sprintf(mustCheckedCount);
              }
            }
          }
        }
        return '';
      },

      customMin: function (el) {
        if (hasAttr(el, 'data-v-min')) {
          let mustMin = $(el).data('vMin');
          let value = $(el).val();

          if (isNaN(value) && ($(el).prop('require') || value.length > 0)) {
            return errorMessages.number;
          }

          if (value < mustMin && ($(el).prop('require') || value.length > 0)) {
            return errorMessages.minValue.sprintf(mustMin);
          }
        }
        return '';
      },

      customMax: function (el) {
        if (hasAttr(el, 'data-v-max')) {
          let mustMax = $(el).data('vMax');
          let value = $(el).val();

          if (isNaN(value) && ($(el).prop('require') || value.length > 0)) {
            return errorMessages.number;
          }

          if (value > mustMax && ($(el).prop('require') || value.length > 0)) {
            return errorMessages.maxValue.sprintf(mustMax);
          }
        }
        return '';
      },

      customMinLength: function (el) {
        if (hasAttr(el, 'data-v-min-length')) {
          let mustMin = $(el).data('vMinLength');
          let value = $(el).val().length;

          if (value < mustMin && ($(el).prop('require') || value > 0)) {
            return errorMessages.minLength.sprintf(mustMin, value);
          }
        }
        return '';
      },

      customMaxLength: function (el) {
        if (hasAttr(el, 'data-v-max-length')) {
          let mustMax = $(el).data('vMaxLength');
          let value = $(el).val().length;

          if (value > mustMax && ($(el).prop('require') || value > 0)) {
            return errorMessages.maxLength.sprintf(mustMax, value);
          }
        }
        return '';
      },

      fileMinSize: function (el) {
        if (hasAttr(el, 'type', 'file')) {
          let size = $(el).data('vMinSize');

          for (let i = 0; i < el.files.length; i++) {
            if (size && size > el.files[i].size) {
              return errorMessages.fileMinSize.sprintf(formatBytes(size));
            }
          }
        }
        return '';
      },

      fileMaxSize: function (el) {
        if (hasAttr(el, 'type', 'file')) {
          let size = $(el).data('vMaxSize');

          for (let i = 0; i < el.files.length; i++) {
            if (size && size < el.files[i].size) {
              return errorMessages.fileMaxSize.sprintf(formatBytes(size));
            }
          }
        }
        return '';
      },

      fileType: function (el) {
        if (hasAttr(el, 'type', 'file')) {
          const mimes = $(el).attr('accept').split(/,\s*/);
          const extensions = getFileExtensionsFromMimeTypes(mimes);

          for (let i = 0; i < el.files.length; i++) {
            const mime = el.files[i].type;

            if (!isMimeTypeMatching(mime, mimes)) {
              return errorMessages.fileType.sprintf(
                extensions.length ? ' (' + extensions.join(', ') + ')' : ''
              );
            }
          }
        }
        return '';
      },
    };

    /**
     * HTML 5 default error to selected language
     * @param el
     * @returns {null|jQuery|HTMLElement|undefined|string|*}
     * @constructor
     */
    let HTML5Default = function (el) {
      if (el.validity.valueMissing) {
        if (el.tagName === 'INPUT') {
          if (
            typeof errorMessages.HTML5.valueMissing.INPUT[el.type] ===
            'undefined'
          ) {
            return errorMessages.HTML5.valueMissing.INPUT.default;
          } else {
            return errorMessages.HTML5.valueMissing.INPUT[el.type];
          }
        } else {
          if (
            typeof errorMessages.HTML5.valueMissing[el.tagName] !== 'undefined'
          ) {
            return errorMessages.HTML5.valueMissing[el.tagName];
          }
        }
      } else if (el.validity.typeMismatch) {
        if (typeof errorMessages.HTML5.typeMismatch[el.type] !== 'undefined') {
          return errorMessages.HTML5.typeMismatch[el.type];
        }
      } else if (el.validity.rangeOverflow) {
        if (typeof errorMessages.HTML5.rangeOverflow[el.type] !== 'undefined') {
          let max = el.getAttribute('max') ?? null;

          if (el.type === 'date' || el.type === 'month') {
            let date = new Date(max);
            max = date.toLocaleDateString();
          }
          if (el.type === 'week') {
            max = 'Week ' + max.substr(6);
          }

          return errorMessages.HTML5.rangeOverflow[el.type].sprintf(max);
        }
      } else if (el.validity.rangeUnderflow) {
        if (
          typeof errorMessages.HTML5.rangeUnderflow[el.type] !== 'undefined'
        ) {
          let min = el.getAttribute('min') ?? null;

          if (el.type === 'date' || el.type === 'month') {
            let date = new Date(min);
            min = date.toLocaleDateString();
          }
          if (el.type === 'week') {
            min = 'Week ' + min.substr(6);
          }

          return errorMessages.HTML5.rangeUnderflow[el.type].sprintf(min);
        }
      } else if (el.validity.stepMismatch) {
        if (typeof errorMessages.HTML5.stepMismatch[el.type] !== 'undefined') {
          let step = el.getAttribute('step') ?? null;

          if (el.type === 'date' || el.type === 'month') {
            let date = new Date(step);
            step = date.toLocaleDateString();
          }
          if (el.type === 'week') {
            step = 'Week ' + step.substr(6);
          }

          return errorMessages.HTML5.stepMismatch[el.type].sprintf(step, step);
        }
      } else if (el.validity.tooLong) {
        let minLength = el.getAttribute('maxlength') ?? null;
        let value = $(el).val();
        return errorMessages.HTML5.tooLong.sprintf(minLength, value.length);
      } else if (el.validity.tooShort) {
        let maxLength = el.getAttribute('minlength') ?? null;
        let value = $(el).val();
        return errorMessages.HTML5.tooShort.sprintf(maxLength, value.length);
      } else if (el.validity.patternMismatch) {
        if (hasAttr(el, 'pattern') && hasAttr(el, 'title')) {
          return $(el).attr('title');
        }
        let pattern = el.getAttribute('pattern') ?? null;
        return errorMessages.HTML5.patternMismatch.sprintf(pattern);
      } else if (el.validity.badInput) {
        if (typeof errorMessages.HTML5.badInput[el.type] !== 'undefined') {
          return errorMessages.HTML5.badInput[el.type];
        }
      }

      return el.validationMessage ?? '';
    };

    /**
     * triger error
     * @param el
     * @param message
     */

    let errorTrigger = function (el, message) {
      if (typeof el === 'object') {
        el = el[0];
      }

      el.setCustomValidity(message);
      showErrorMessage(el, el.validationMessage);
    };

    let reload = function () {
      run();
    };

    /**
     * attr equal with value or has attr
     * @param el
     * @param attr
     * @param value
     * @returns {boolean}
     */
    function hasAttr(el, attr, value = '') {
      let val = $(el).attr(attr);

      if (typeof val !== typeof undefined && val !== false) {
        if (value) {
          if (value === val) {
            return true;
          }
        } else {
          return true;
        }
      }

      return false;
    }

    /**
     * php sprintf alternate
     * @returns {string}
     */
    String.prototype.sprintf = function () {
      var output = this.toString();
      for (var i = 0; i < arguments.length; i++) {
        var asNum = parseFloat(arguments[i]);
        if (asNum || asNum == 0) {
          var suffix = asNum > 1 || asNum == 0 ? 's' : '';
          output = output.replace(/%s {1}(\w+)\(s\){1}/, '%s $1' + suffix);
        }
        output = output.replace('%s', arguments[i]);
      }
      return output;
    };

    run();

    return {
      validator,
      errorTrigger,
      reload,
      checkAll,
    };
  };
})(jQuery);
