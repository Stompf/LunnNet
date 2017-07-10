import * as React from 'react';
import './About.css';

const logo = require('./logo.svg');

class About extends React.Component<{}, {}> {
    constructor() {
        super();
    }

    render() {
        return (
            <div className="About">
                <div className="About-header">
                    <img src={logo} className="About-logo" alt="logo" />
                    <h2>Welcome to React</h2>
                </div>
                <p className="About-intro">
                    To get started, edit <code>src/About.tsx</code> and save to reload. Hej hopp
        </p>
            </div>
        );
    }
}

export default About;
