tinymce.PluginManager.add('AwsS3Upload', (editor, url)=> {

    //Grab the params from TinyMCE init
    const {bucketName, folderName = '', awsAuth, buttonText = 'Upload File', progress, secondFileSelectedBeforeFirstUpload} = editor.getParam('Awss3UploadSettings');
    let inProgress = false;

    //Initializing parameters control
    if (!bucketName) {
        console.log('`bucketName` parameter missing on init AwsS3Upload TinyMCE plugin.');
        return false;
    }
    //awsAuth control
    if (awsAuth && typeof awsAuth === 'object') {
        const {secretAccessKey, accessKeyId, region} = awsAuth;
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
        //Ok let's update the auth config
        AWS.config.region = region;
        AWS.config.update({
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey
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

    //Creating bucket
    let bucket = new AWS.S3({
        params: {
            Bucket: bucketName
        }
    });


    inputEl.addEventListener('change', e => {
        e.preventDefault();

        //Select the file & contentAreaContainer
        let file = inputEl.files[0],
            contentAreaContainer = editor.contentAreaContainer;


        //If file exists
        if (file) {

            // Put the progress bar inside content area of TinyMCE
            contentAreaContainer.parentNode.insertBefore(progressEl, contentAreaContainer);
            if (progress.bar && typeof progress.bar === 'boolean')
                progressEl.style.cssText = 'display:block;position: absolute;z-index: 9999;width: 120px;height: 15px;right: 10px;top:45px';


            // We are uploading right now
            inProgress = true;

            let extension = file.name.split('.').pop(),
                fileName = file.name.split('.' + extension)[0],
                objKey = (folderName) + '/' + fileName + '-' + Date.now() + '.' + extension,
                params = {
                    Key: objKey,
                    ContentType: file.type,
                    Body: file,
                    ACL: 'public-read'
                };

            bucket.putObject(params).on('httpUploadProgress', progressObj => {
                let progressPercentage = parseInt((progressObj.loaded / progressObj.total) * 100);

                // Change the value of progressbar. No matter if it's visible or not
                progressEl.value = progressPercentage;

                // Call the callback function if it's exists
                if (progress.callback && typeof progress.callback === 'function')
                    progress.callback(progressPercentage);

            }).send((err, data) => {

                inProgress = false;
                progressEl.style.cssText = 'display:none';

                if (err) {
                    if (progress.errorCallback && typeof progress.errorCallback === 'function')
                        progress.errorCallback(err);
                } else {
                    var url = 'https://s3.amazonaws.com/' + bucketName + '/' + objKey;

                    if(progress.successCallback && typeof progress.successCallback === 'function')
                        progress.successCallback(editor,url);

                }
            });

        } else {

        }
    });


    editor.addButton('AwsS3UploadButton', {
        text: buttonText,
        icon: false,
        onclick(){
            if (!inProgress)
                inputEl.click();
            else {
                if (secondFileSelectedBeforeFirstUpload.callback && typeof secondFileSelectedBeforeFirstUpload.callback === 'function')
                    secondFileSelectedBeforeFirstUpload.callback();
                else
                    alert('Progress allready');

            }
        }
    })


});