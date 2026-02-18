import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    section: {
        margin: 10,
        padding: 10,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingVertical: 5,
    },
    label: {
        width: '40%',
        color: '#666',
    },
    value: {
        width: '60%',
    },
});

interface InvoiceProps {
    id: string;
    date: Date;
    amount: number;
    description: string;
    customerName: string;
    customerEmail: string;
}

export const InvoiceDocument = ({ id, date, amount, description, customerName, customerEmail }: InvoiceProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>INVOICE</Text>
                    <Text style={{ color: '#666', fontSize: 10 }}>Trackr Inc.</Text>
                </View>
                <View>
                    <Text style={{ fontSize: 10 }}>Date: {date.toLocaleDateString()}</Text>
                    <Text style={{ fontSize: 10 }}>Invoice #: {id.slice(0, 8)}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={{ fontSize: 14, marginBottom: 10, fontWeight: 'bold' }}>Bill To:</Text>
                <Text>{customerName}</Text>
                <Text>{customerEmail}</Text>
            </View>

            <View style={styles.section}>
                <Text style={{ fontSize: 14, marginBottom: 10, fontWeight: 'bold' }}>Details:</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Description</Text>
                    <Text style={styles.value}>{description}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Amount</Text>
                    <Text style={styles.value}>${(amount / 100).toFixed(2)}</Text>
                </View>
            </View>

            <View style={{ marginTop: 40, borderTopWidth: 2, paddingTop: 10 }}>
                <Text style={{ fontSize: 20, textAlign: 'right' }}>Total: ${(amount / 100).toFixed(2)}</Text>
            </View>
        </Page>
    </Document>
);
