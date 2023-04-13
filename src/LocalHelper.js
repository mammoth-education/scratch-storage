const log = require('./log');

const Asset = require('./Asset');
const AssetType = require('./AssetType');
const DataFormat = require('./DataFormat');
const Helper = require('./Helper');


/**
 * @typedef {function} UrlFunction - A function which computes a URL from asset information.
 * @param {Asset} - The asset for which the URL should be computed.
 * @returns {(string|object)} - A string representing the URL for the asset request OR an object with configuration for
 *                              the underlying fetch call (necessary for configuring e.g. authentication)
 */
class LocalHelper extends Helper {
    constructor (parent) {
        super(parent);
        // let _TextDecoder;
        // if (typeof TextDecoder === 'undefined') {
        //     _TextDecoder = require('text-decoding').TextDecoder;
        // } else {
        //     /* global TextDecoder */
        //     _TextDecoder = TextDecoder;
        // }
        // const decoder = new _TextDecoder();

        this.assetDatas = {};
        this.projectList = {};
        this.init();
    }

    init = () => {
        for (let key in AssetType) {
            this.assetDatas[key] = this._get("asset-" + key, {});
        }
        this.projectList = this._get("project-list", {});
    }
    _get = (name, defaultValue) => {
        let value = window.localStorage.getItem(name);
        if (value === null || value === undefined) {
            value = defaultValue;
        } else {
            try {
                value = JSON.parse(value);
            } catch (e) {
                value = defaultValue;
            }
        }
        return value;
    }

    store = (assetType, dataFormat, data, assetId) => {
        dataFormat = dataFormat || assetType.runtimeFormat;
        switch (dataFormat) {
            case DataFormat.WAV:
                data = Array.from(data);
                break;
            case DataFormat.SVG:
                data = Array.from(data);
                break;
        }
        this.assetDatas[assetType.name][assetId] = data
        window.localStorage.setItem("asset-" + assetType.name, JSON.stringify(this.assetDatas[assetType.name]));
        return Promise.resolve({
            status: 'ok',
            id: assetId
        });
    }
    load = (assetType, assetId, dataFormat) => {
        dataFormat = dataFormat || assetType.runtimeFormat;
        if (window.cordova && window.cordova.platformId !== 'ios')  {
            return null;
        }
        let url = cordova.file.applicationDirectory + "www" +`/static/asset/${assetId}.${dataFormat}`;
        return this.readIosFileData(url).then((data) => {
            if (data) {
                switch (dataFormat) {
                    case DataFormat.WAV:
                        data = new Uint8Array(data);
                        break;
                    case DataFormat.SVG:
                        data = new Uint8Array(data);
                        break;
                }
                const asset = new Asset(assetType, assetId, dataFormat, data);
                return asset;
            } else { 
                return null;
            }
        }, () => null);
        
    }
    readIosFileData = (fileUrl) => {
        return new Promise(function(resolve, reject) {
          // 获取文件
          window.resolveLocalFileSystemURL(fileUrl, function(fileEntry) {
            // 获取到文件的 FileEntry 对象
            // 读取文件内容
            fileEntry.file(function(file) {
              // 创建 FileReader 对象
              var fileReader = new FileReader();
              // 读取文件内容
              fileReader.onloadend = function() {
                  // 文件内容已经读取完毕
                var fileData = this.result; // 获取到的文件数据
                console.log("fileData",fileData)
                // var uint8Array = new Uint8Array(fileData)
                // console.log("Uint8Array",fileData)
                resolve(fileData);
              };
              // 开始读取文件
              fileReader.readAsArrayBuffer(file);
              
            });
          }, function(error) {
            // 获取文件失败
            reject(error);
          });
        });
    }
}

module.exports = LocalHelper;
