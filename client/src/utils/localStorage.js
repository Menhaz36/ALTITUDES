import React from 'react'

export function setItem(key, value) {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
    }   catch (error) {
        console.error("Error setting item to localStorage", error);
    }
}
export function getItem(key) {
    try {
        const serializedValue = localStorage.getItem(key);
        if (serializedValue === null) {
            return null;
        }
        return JSON.parse(serializedValue);
    }   catch (error) {
        console.error("Error getting item from localStorage", error);
        return null;
    }   
}
export function removeItem(key) {
    try {
        localStorage.removeItem(key);
    }   catch (error) {
        console.error("Error removing item from localStorage", error);
    }   
}