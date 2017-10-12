import * as React from 'react';
import * as i18next from 'i18next';

export class Ko extends React.Component<any>{

    render() {
        return (<div>{i18next.t('key')}</div>);
    }

}