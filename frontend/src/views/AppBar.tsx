import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { withRouter, useHistory } from 'react-router-dom';
import useStyles from 'style/AppBarStyles1';


const options = [
    'Material Inventory',
    'Welding',
    'Stringing',
    'Bending',
    'Coating',
    'Other',
];
const ITEM_HEIGHT = 48;

const MenuAppBar = (props: { history: any; }) => {
    
    const [anchorE2, setAnchorE2] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorE2);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorE2(event.currentTarget);
    };
    const handleClose1 = () => {
        setAnchorE2(null);
    };
        
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    //For app bar buttons
    const classes = useStyles();
    const history = useHistory();
    const handleButtonsClick = (pageURL: string) => {
        history.push(pageURL);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar className={classes.appContainer}>
                    <IconButton
                        id="long-button"
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="more"
                        aria-controls="long-menu"
                        aria-expanded={open ? 'true' : undefined}
                        aria-haspopup="true"
                        onClick={handleClick}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Menu
                        id="long-menu"
                        MenuListProps={{
                            'aria-labelledby': 'long-button',
                        }}
                        anchorEl={anchorE2}
                        open={open}
                        onClose={handleClose1}
                        PaperProps={{
                            style: {
                                maxHeight: ITEM_HEIGHT * 4.5,
                                width: '20ch',
                            },
                        }}
                    >
                        {options.map((option) => (
                            <MenuItem key={option} selected={option === 'Pyxis'} onClick={handleClose1}>
                                {option}
                            </MenuItem>
                        ))}
                    </Menu>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>

                    </Typography>
                    {/*menu items from app bar*/}
                    <div className = "headerOptions">
                        <Button onClick={() => handleButtonsClick('/dashboard')}> Home </Button>
                        <Button onClick={() => handleButtonsClick('/about')}> About </Button>
                        <Button onClick={() => handleButtonsClick('/dashboard')}> Services </Button>
                        <Button onClick={() => handleButtonsClick('/dashboard')}> Training </Button>
                        <Button onClick={() => handleButtonsClick('/dashboard')}> Careers </Button>
                        <Button onClick={() => handleButtonsClick('/contact')}> Contact Us </Button>
                    </div>
                    
                    <div>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleClose}>Profile</MenuItem>
                            <MenuItem onClick={handleClose}>My account</MenuItem>
                            <MenuItem onClick={handleClose}>Logout</MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
export default withRouter(MenuAppBar)