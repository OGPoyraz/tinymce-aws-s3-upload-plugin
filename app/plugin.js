tinymce.PluginManager.add('AwsS3Upload', (editor, url) => {
    //Grab the params from TinyMCE init
    const {
        bucketName,
        folderName = '',
        awsAuth,
        buttonText = 'Upload File',
        conditions = {},
        progress,
        secondFileSelectedBeforeFirstUpload
    } = editor.getParam('Awss3UploadSettings');
    const {secretAccessKey, accessKeyId, region} = awsAuth;
    const {contentLengthRange = {min: 0, max: null}} = conditions;
    let inProgress = false;

    //Initializing parameters control
    if (!bucketName) {
        console.log('`bucketName` parameter missing on init AwsS3Upload TinyMCE plugin.');
        return false;
    }

    //awsAuth control
    if (awsAuth && typeof awsAuth === 'object') {
        if (!accessKeyId) {
            console.log('`awsAuth` parameter missing `accessKeyId` property on init AwsS3Upload TinyMCE plugin.');
            return false;
        }
        if (!secretAccessKey) {
            console.log('`awsAuth` parameter missing `secretAccessKey` property on init AwsS3Upload TinyMCE plugin.');
            return false;
        }
        if (!region) {
            console.log('`awsAuth` parameter missing `secretAccessKey` property on init AwsS3Upload TinyMCE plugin.');
            return false;
        }
        //Let's update the auth config
        AWS.config.update({
            region,
            accessKeyId,
            secretAccessKey
        });
    }

    //Adding file input to DOM
    const textarea = editor.targetElm;
    let inputEl = document.createElement('input');
    inputEl.type = 'file';
    inputEl.style.cssText = 'display:none';
    textarea.parentNode.insertBefore(inputEl, textarea);

    //Create progress element
    let progressEl = document.createElement('progress');
    progressEl.max = 100;
    progressEl.value = 10;
    progressEl.style.cssText = 'display:none';
    textarea.parentNode.insertBefore(progressEl, textarea);

    inputEl.addEventListener('change', e => {
        e.preventDefault();

        //Select the file & contentAreaContainer
        let file = inputEl.files[0],
            contentAreaContainer = editor.contentAreaContainer;

        //If file exists
        if (file) {
            checkContentLenghtRange(file);

            // Put the progress bar inside content area of TinyMCE
            contentAreaContainer.parentNode.insertBefore(progressEl, contentAreaContainer);
            if (progress.bar && typeof progress.bar === 'boolean')
                progressEl.style.cssText = 'display:block;position: absolute;z-index: 9999;width: 120px;height: 15px;right: 10px;top:45px';

            // We are uploading right now
            inProgress = true;

            let extension = file.name.split('.').pop(),
                fileName = file.name.split('.' + extension)[0],
                objKey = (folderName ? `${folderName}/` : '') + fileName + '-' + Date.now() + '.' + extension;

            // Use S3 ManagedUpload class as it supports multipart uploads
            let upload = new AWS.S3.ManagedUpload({
                params: {
                    Bucket: bucketName,
                    Key: objKey,
                    Body: file,
                    ContentType: file.type,
                    ACL: 'public-read',
                }
            });

            const promise = upload.promise();

            promise.then(
                function (data) {
                    const newS3ImageUrl = data.Location;
                    inProgress = false;
                    progressEl.style.cssText = 'display:none';

                    if (progress && progress.successCallback) {
                        progress.successCallback(editor, newS3ImageUrl);
                    } else {
                        defaultSuccessCallback(editor, newS3ImageUrl)
                    }

                },
                function (err) {
                    return alert("There was an error uploading your photo: ", err.message);
                }
            );
        }
    });

    editor.ui.registry.addButton('AwsS3UploadButton', {
        text: buttonText,
        onAction: () => {
            if (!inProgress)
                inputEl.click();
            else {
                if (secondFileSelectedBeforeFirstUpload.callback && typeof secondFileSelectedBeforeFirstUpload.callback === 'function')
                    secondFileSelectedBeforeFirstUpload.callback();
                else
                    alert('Progress allready');

            }
        }
    });

    function checkContentLenghtRange(file) {
        let isContentLengthOutOfRange =
            (typeof contentLengthRange.min === 'number' && file.size < contentLengthRange.min)
            || (typeof contentLengthRange.max === 'number' && file.size > contentLengthRange.max);

        if (isContentLengthOutOfRange) {
            let err = new RangeError(
                `The content length of '${file.name}' must be between ${contentLengthRange.min} and ${contentLengthRange.max} bytes.`
            );

            //err.fileSize = file.size;

            if (contentLengthRange.errorCallback && typeof contentLengthRange.errorCallback === 'function')
                contentLengthRange.errorCallback(err);

            throw err;
        }
    }

    function defaultSuccessCallback(editor, url) {
        // For example
        switch (url.split('.').pop()) {
            case 'png':
            case 'jpg':
            case 'jpeg': {
                editor.execCommand('mceInsertContent', false, `<img src="${url}" style="display: block;margin: 0 auto;text-align: center; max-width:100%;" />`);
                break;
            }
            default: {
                editor.execCommand('mceInsertContent', false, `<a href="${url}">${url}</a>`);
            }
        }
    }

});
