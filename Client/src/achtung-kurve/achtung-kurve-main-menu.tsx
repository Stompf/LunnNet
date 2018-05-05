import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, MenuItem, WithStyles, Menu } from 'material-ui';
import { StyleRules, withStyles } from 'material-ui/styles';

interface AchtungKurveProps {}

interface AchtungKurveState {
    anchorEl: HTMLElement | undefined;
}

const styles = () => ({} as StyleRules);

export const AchtungKurveMainMenu = withStyles(styles)(
    class extends React.Component<AchtungKurveProps & WithStyles, AchtungKurveState> {
        constructor(props: AchtungKurveProps & WithStyles) {
            super(props);
            this.state = {
                anchorEl: undefined
            };
        }

        render() {
            const LocalLink = (props: any) => <Link to="/kurve/local" {...props} />;
            const NetworkLink = (props: any) => <Link to="/kurve/network" {...props} />;
            const { anchorEl } = this.state;
            const open = Boolean(anchorEl);

            return (
                <div>
                    <Button
                        color="inherit"
                        aria-owns={open ? 'menu-appbar-kruve' : undefined}
                        aria-haspopup="true"
                        onClick={this.handleClick}
                    >
                        Kurve
                    </Button>
                    <Menu
                        id="menu-appbar-kruve"
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
);
