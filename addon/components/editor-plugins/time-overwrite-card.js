import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/time-overwrite-card';

/**
* Card displaying a hint of the Date plugin
*
* @module editor-time-overwrite-plugin
* @class TimeOverwriteCard
* @extends Ember.Component
*/
export default Component.extend({
  layout,

  /**
   * Region on which the card applies
   * @property location
   * @type [number,number]
   * @private
  */
  location: reads('info.location'),

  /**
   * Unique identifier of the event in the hints registry
   * @property hrId
   * @type Object
   * @private
  */
  hrId: reads('info.hrId'),

  /**
   * The RDFa editor instance
   * @property editor
   * @type RdfaEditor
   * @private
  */
  editor: reads('info.editor'),

  /**
   * Hints registry storing the cards
   * @property hintsRegistry
   * @type HintsRegistry
   * @private
  */
  hintsRegistry: reads('info.hintsRegistry'),

  didReceiveAttrs() {
    this._super(...arguments);
    this.set('newTime', this.info.value);
  },

  actions: {
    insert(){
      // TODO: Validations are done because Safari currently does not support <input type="time">. They should be removed once Safari (and some other minor browser) support this feature.
      const time = this.newTime.trim().replace(/\s+/g, '').replace(/AM|PM/g, match => ` ${match}`);
      const hour = time.split(':')[0];

      const isWellFormatted = /^([0-1][0-9]|2[0-3]):([0-5][0-9]) (AM|PM)?$/.test( time ) != -1;
      const isDesignated = time.search( /AM|PM/ ) != -1;
      const isValidHour = !isDesignated || (isDesignated && hour < 13);

      const format24 = time => time.includes('PM') ? `${parseInt(time.split(':')[0]) + 12}:${time.replace(' PM', '').split(':')[1]}` : time.replace(' AM', '');

      if( isWellFormatted && isValidHour ) {
        const mappedLocation = this.get('hintsRegistry').updateLocationToCurrentIndex(this.get('hrId'), this.get('location'));
        this.get('hintsRegistry').removeHintsAtLocation(mappedLocation, this.get('hrId'), 'editor-plugins/time-overwrite-card');

        const selection = this.editor.selectContext(mappedLocation, { datatype: this.info.datatype });
        this.editor.update(selection, {
          set: {
            content: format24(time),
            innerHTML: time
          }
        });
        this.hintsRegistry.removeHintsAtLocation(this.location, this.hrId, this.who);
      }
    }
  }
});
