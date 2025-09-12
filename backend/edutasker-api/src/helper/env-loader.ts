import { config, type DotenvConfigOptions } from 'dotenv';
import type { Schema, ValidationResult } from 'joi';

export type TValidator = Record <string, Schema>;

type TEnvKeyType<DataType, K extends keyof DataType> = DataType[K];

type TEnvKeyMap<DataType> = {
    [Property in keyof DataType ]: TEnvKeyType<DataType, Property>;
}

const envConfigOptionLoader = (option?: DotenvConfigOptions): void => {
    if (option) {
        config(option);
    }
    config();
}

export class ConfigLoader<T extends {}> {
    private env: TEnvKeyMap<T> = {} as TEnvKeyMap<T>;
    constructor (validators: TValidator, postProcess?: (env: TEnvKeyMap<T>) => TEnvKeyMap<T>) {
        envConfigOptionLoader();
        const envList = process?.env;
        const validatorList = Object.entries(validators);
        if (!envList) {
            throw new Error (`Can't load config`);
        }
        for(const [key, validator] of validatorList) {
            const envItem = envList[key];
            const {value, error}: ValidationResult = validator.validate(envItem, {
                abortEarly: false,
                allowUnknown: false,
                stripUnknown: true
            });
            if (error) {
                throw error;
            }
            this.env[key as keyof T] = value;
            console.log(`Add ENV with name ${key}: Success \n`);
        }
        if (postProcess) {
            this.env = postProcess(this.env);
        }
    }

    public get config () {
        return new Proxy (this.env, {
            get:<K extends keyof T>(target: T, prop: string | symbol) => {
                if (prop in target) {
                    return target[prop as K];
                } else {
                    throw new Error (`Can't get the env value because it don't existed`);
                }
            }
        });
    }
}

export default ConfigLoader;