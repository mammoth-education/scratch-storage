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
        let data = this.assetDatas[assetType.name][assetId];

        if (data) {
            switch (dataFormat) {
                case DataFormat.WAV:
                    data = Uint8Array.from(data);
                    break;
                case DataFormat.SVG:
                    data = Uint8Array.from(data);
                    break;
            }
            const asset = new Asset(assetType, assetId, dataFormat, data);
            return Promise.resolve(asset);
        } else {
            return null;
        }
    }
}

module.exports = LocalHelper;
