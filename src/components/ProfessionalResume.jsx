import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { parseHtmlContent } from '../utilis/htmlParser';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    marginBottom: 5,
    textAlign: 'center',
  },
  contactInfo: {
    fontSize: 10,
    marginBottom: 3,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
    paddingBottom: 3,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 5,
  },
  list: {
    marginLeft: 15,
    marginBottom: 5,
  },
  listItem: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 3,
  },
});

const ResumePDF = ({ content, userDetails }) => {
  // Parse the HTML content into structured sections
  const parsedSections = parseHtmlContent(content || '');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{userDetails?.name || ''}</Text>
          <Text style={styles.contactInfo}>
            {[
              userDetails?.email,
              userDetails?.phone,
              userDetails?.location
            ].filter(Boolean).join(' | ')}
          </Text>
          {userDetails?.linkedin && (
            <Text style={styles.contactInfo}>LinkedIn: {userDetails.linkedin}</Text>
          )}
          {userDetails?.github && (
            <Text style={styles.contactInfo}>GitHub: {userDetails.github}</Text>
          )}
          {userDetails?.portfolio && (
            <Text style={styles.contactInfo}>Portfolio: {userDetails.portfolio}</Text>
          )}
        </View>

        {parsedSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title || ''}</Text>
            
            {section.content.map((item, itemIndex) => {
              if (item.type === 'paragraph') {
                return (
                  <Text key={itemIndex} style={styles.paragraph}>
                    {item.text || ''}
                  </Text>
                );
              } else if (item.type === 'list') {
                return (
                  <View key={itemIndex} style={styles.list}>
                    {item.items.map((listItem, listItemIndex) => (
                      <Text key={listItemIndex} style={styles.listItem}>
                        • {listItem || ''}
                      </Text>
                    ))}
                  </View>
                );
              }
              return null;
            })}
          </View>
        ))}
      </Page>
    </Document>
  );
};

export default ResumePDF;