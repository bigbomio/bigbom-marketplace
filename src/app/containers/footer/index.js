import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';

class Footer extends PureComponent {
    render() {
        return (
            <div id="footer" className="container-wrp">
                <div className="container">
                    <footer className="wrapper">
                        <div className="social-list">
                            <a className="cycle-box tele" href="https://t.me/bigbomicogroup" target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-telegram-plane" />
                            </a>
                            <a className="cycle-box face" href="https://www.facebook.com/bigbom.global/" target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-facebook-f" />
                            </a>
                            <a className="cycle-box link" href="http://google.com/" target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-linkedin-in" />
                            </a>
                            <a
                                className="cycle-box youtu"
                                href="https://www.youtube.com/channel/UCs6LAeB75nLLmHyQtGtl4uA"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <i className="fab fa-youtube" />
                            </a>
                            <a className="cycle-box git" href="https://github.com/bigbomio" target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-github" />
                            </a>
                            <a className="cycle-box twi" href="https://twitter.com/bigbomglobal" target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-twitter" />
                            </a>
                        </div>
                        <div className="link-interm">
                            <a
                                href="https://bigbom.sgp1.digitaloceanspaces.com/files/landing-page/Bigbom-Limited-Privacy-Policy.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Privacy Policy
                            </a>
                            <span className="line-ver">|</span>
                            <a
                                href="https://bigbom.sgp1.digitaloceanspaces.com/files/landing-page/Bigbom-Ecosystem-Pre-ICO-Terms_draft.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Terms & Conditions
                            </a>
                            <span className="line-ver">|</span>
                            <Link to="/faq">FAQ</Link>
                        </div>
                        <div className="cpyRight">Copyright 2018 by Bigbom All rights reserved.</div>
                    </footer>
                </div>
            </div>
        );
    }
}

export default Footer;
