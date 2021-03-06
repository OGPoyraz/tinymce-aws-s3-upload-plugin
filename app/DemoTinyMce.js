/**
 * Created by OGPoyraz on 10/09/16.
 */
import React from 'react';

class DemoTinyMce extends React.Component {
    componentDidMount() {
        tinymce.init({
            selector: 'textarea',
            height: 500,
            menubar: true,

            // Plugin configuration
            plugins: 'AwsS3Upload',
            toolbar: 'AwsS3UploadButton',
            Awss3UploadSettings: {
                buttonText: 'Upload to AWS S3',  // opt
                folderName: 'test',           // opt
                bucketName: 'tinymce-aws-s3-upload',
                conditions: {
                  contentLengthRange: {
                    min:0,
                    max:2048,
                    errorCallback: err => {
                      alert('sorry, but: '+err.message);
                    }
                  }
                },
                awsAuth: {                       // opt if auth done in html before
                    region: 'us-west-1',
                    accessKeyId: 'AKIAI5LLXK3LLK4ISBPQ',
                    secretAccessKey: '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'
                },
                progress: {
                    bar:true,                    //opt default=true
                    callback: progress=> {       //opt
                        console.log(progress)
                    },
                    errorCallback: err => {      //opt
                        console.log(err)
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
