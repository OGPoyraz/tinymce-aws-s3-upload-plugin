/**
 * Created by OGPoyraz on 10/09/16.
 */
import React from 'react';

class DemoTinyMce extends React.Component {
    componentDidMount() {
        tinymce.init({
            selector: 'textarea',
            height: 500,
            menubar: false,

            // Plugin configuration
            plugins: 'AwsS3Upload',
            toolbar: 'AwsS3UploadButton',
            Awss3UploadSettings: {
                buttonText: 'Upload to AWS S3',  // opt
                folderName: 'testing',           // opt
                bucketName: 'thy-wiki',
                awsAuth: {                       // opt if auth done in html before
                    region: 'us-east-1',
                    accessKeyId: 'AKIAJAZ7WVGXBDMJBHVA',
                    secretAccessKey: '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'
                },
                progress: {
                    bar:true,                    //opt default=true
                    callback: progress=> {       //opt
                        console.log(progress)
                    },
                    errorCallback: err => {      //opt
                        console.log(error)
                    },
                    successCallback:(editor,url) => {  //opt

                        // For example
                        switch(url.split('.').pop()){
                            case 'png':
                            case 'jpg':
                            case 'jpeg':{
                                editor.execCommand('mceInsertContent', false, `<img src="${url}" style="display: block;margin: 0 auto;text-align: center; max-width:100%;" />`);
                                break;
                            }
                            default:{
                                editor.execCommand('mceInsertContent', false, `<a href="${url}">${url}</a>`);
                            }

                        }

                    }
                },
                secondFileSelectedBeforeFirstUpload:{ //opt
                    callback:()=>{
                        alert('You cannot upload because first upload is progressing');
                    }
                }
            }

        });
    }

    render() {
        return (
            <textarea cols="30" rows="10"></textarea>
        )
    }
}

export default DemoTinyMce;