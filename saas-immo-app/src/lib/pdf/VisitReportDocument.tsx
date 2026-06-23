import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#1C1B19",
  },
  header: {
    marginBottom: 24,
    borderBottom: "1pt solid #E4DFD4",
    paddingBottom: 16,
  },
  agencyName: {
    fontSize: 18,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    marginBottom: 16,
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    color: "#5B6B57",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 120,
    color: "#1C1B19",
    opacity: 0.6,
  },
  value: {
    flex: 1,
  },
  notesBox: {
    border: "1pt solid #E4DFD4",
    borderRadius: 4,
    padding: 12,
    minHeight: 100,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: "#1C1B19",
    opacity: 0.4,
    textAlign: "center",
  },
});

type VisitReportProps = {
  agencyName: string;
  agentName: string;
  date: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyPrice: number | null;
  notes: string;
};

export function VisitReportDocument(props: VisitReportProps) {
  const formattedDate = new Date(props.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.agencyName}>{props.agencyName}</Text>
          <Text>Compte-rendu de visite</Text>
        </View>

        <Text style={styles.title}>Visite du {formattedDate}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bien visité</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Bien</Text>
            <Text style={styles.value}>{props.propertyTitle}</Text>
          </View>
          {props.propertyAddress && (
            <View style={styles.row}>
              <Text style={styles.label}>Adresse</Text>
              <Text style={styles.value}>{props.propertyAddress}</Text>
            </View>
          )}
          {props.propertyPrice && (
            <View style={styles.row}>
              <Text style={styles.label}>Prix</Text>
              <Text style={styles.value}>{props.propertyPrice.toLocaleString("fr-FR")} €</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visiteur</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom</Text>
            <Text style={styles.value}>{props.contactName}</Text>
          </View>
          {props.contactEmail && (
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{props.contactEmail}</Text>
            </View>
          )}
          {props.contactPhone && (
            <View style={styles.row}>
              <Text style={styles.label}>Téléphone</Text>
              <Text style={styles.value}>{props.contactPhone}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Remarques de l&apos;agent</Text>
          <View style={styles.notesBox}>
            <Text>{props.notes}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agent</Text>
          <Text>{props.agentName}</Text>
        </View>

        <Text style={styles.footer}>
          Document généré par {props.agencyName} — {formattedDate}
        </Text>
      </Page>
    </Document>
  );
}
