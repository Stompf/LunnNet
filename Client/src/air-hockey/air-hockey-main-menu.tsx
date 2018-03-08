import * as React from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import { Button, Grid } from 'material-ui';

interface AirHockeyProps extends RouteComponentProps<any> {}

class AirHockeyMainMenu extends React.Component<AirHockeyProps> {
    render() {
        const LocalLink = (props: any) => <Link to="/air-hockey/local" {...props} />;
        const NetworkLink = (props: any) => <Link to="/air-hockey/network" {...props} />;

        return (
            <Grid container justify="center" alignItems="center" direction="column">
                <Grid item xs={6} style={{ marginTop: '5px' }}>
                    <div>
                        <Button fullWidth variant="raised" color="primary" component={LocalLink}>
                            Local play
                        </Button>
                    </div>
                    <div style={{ marginTop: '5px' }}>
                        <Button fullWidth variant="raised" color="primary" component={NetworkLink}>
                            Network play
                        </Button>
                    </div>
                </Grid>
            </Grid>
        );
    }
}

export default AirHockeyMainMenu;
