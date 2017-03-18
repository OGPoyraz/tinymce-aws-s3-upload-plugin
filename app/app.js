import React from 'react';
import {render} from 'react-dom';
import "./styles.scss";
import DemoTinyMce from './DemoTinyMce'

render(
    <div>
        <a href="https://github.com/OGPoyraz/tinymce-aws-s3-upload-plugin"><img style={{position:'absolute',top:'0',right:'0',border:0}} src="https://camo.githubusercontent.com/38ef81f8aca64bb9a64448d0d70f1308ef5341ab/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6461726b626c75655f3132313632312e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png"/></a>
        <div className="ui container">
            <h1 className="repo-name">tinymce-amazon-s3-upload-plugin</h1>
            <p>This plugin entegrates a Amazon S3 upload button to your TinyMCE.</p>
            <h2>Usage</h2>
            <p>Please look at the <a href="https://github.com/OGPoyraz/tinymce-aws-s3-upload-plugin" target="_blank">Github repository</a> for more information.</p>
            <DemoTinyMce></DemoTinyMce>
        </div>
    </div>, document.getElementById('root'));
