import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, MenuItem, WithStyles, Menu } from 'material-ui';
import { withStyles, StyleRules } from 'material-ui/styles';

interface AirHockeyProps {}

interface AirHockeyState {
    anchorEl: HTMLElement | undefined;
}

const styles = () => ({} as StyleRules);

class AirHockeyMainMenu extends React.Component<AirHockeyProps & WithStyles, AirHockeyState> {
    constructor(props: AirHockeyProps & WithStyles) {
        super(props);
        this.state = {
            anchorEl: undefined
        };
    }

    render() {
        const LocalLink = (props: any) => <Link to="/air-hockey/local" {...props} />;
        const NetworkLink = (props: any) => <Link to="/air-hockey/network" {...props} />;
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);

        return (
            <div>
                <Button
                    color="inherit"
                    aria-owns={open ? 'menu-appbar-hockey' : undefined}
                    aria-haspopup="true"
                    onClick={this.handleClick}
                >
                    Air hockey
                </Button>
                <Menu
                    id="menu-appbar-hockey"
                    anchorEl={anchorEl}
                    getContentAnchorEl={undefined}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                    }}
                    open={open}
                    onClose={this.handleClose}
                >
                    <MenuItem component={LocalLink} onClick={this.handleClose}>
                        Local play
                    </MenuItem>
                    <MenuItem component={NetworkLink} onClick={this.handleClose}>
                        Network play
                    </MenuItem>
                </Menu>
            </div>
        );
    }

    private handleClick = (event: React.MouseEvent<HTMLElement>) => {
        this.setState({ anchorEl: event.currentTarget });
    };

    private handleClose = () => {
        this.setState({ anchorEl: undefined });
    };
}

export default withStyles(styles)(AirHockeyMainMenu);
