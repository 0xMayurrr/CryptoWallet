import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useWallet } from '../store/WalletContext';
import { Theme } from '../constants';
import Toast from '../components/Toast';

const SPEND_OPTIONS = [
  { label: 'Coffee',    amount: 5,  icon: 'coffee'    },
  { label: 'Pizza',     amount: 15, icon: 'package'   },
  { label: 'Groceries', amount: 50, icon: 'shopping-bag' },
  { label: 'Fuel',      amount: 80, icon: 'zap'       },
];

const COINS = ['ETH', 'USDT', 'BTC', 'SOL'];

// ─── Web Card Management (Exact Stitch Port) ──────────────────────────────────
const WebCardManagement = ({ cardBalance, cardFrozen, T, walletAddress }: any) => {
  return (
    <View style={webCardStyles.container}>
      <Text style={[webCardStyles.title, { color: T.text }]}>Card Management</Text>
      <Text style={[webCardStyles.sub, { color: T.textMuted }]}>
        Control your high-limit obsidian assets with real-time security and global flexibility.
      </Text>

      <View style={webCardStyles.mainRow}>
        <View style={webCardStyles.cardColumn}>
           <LinearGradient colors={['#191C1E', '#343A40']} style={webCardStyles.obsidianCard}>
              <View style={webCardStyles.cardTop}>
                 <Text style={webCardStyles.cardClient}>Preferred Client</Text>
                 <Text style={webCardStyles.cardBrand}>CryptoWallet</Text>
              </View>
              <View style={webCardStyles.cardMid}>
                 <Text style={webCardStyles.cardNumber}>• • • •  • • • •  • • • •  • • • •</Text>
              </View>
              <View style={webCardStyles.cardBottom}>
                 <View>
                    <Text style={webCardStyles.cardExpLabel}>Exp Date</Text>
                    <Text style={webCardStyles.cardExpValue}>11 / 28</Text>
                 </View>
                 <View style={webCardStyles.chipSim}><Text style={webCardStyles.chipSimText}>OBSIDIAN</Text></View>
              </View>
              {cardFrozen && <View style={webCardStyles.frozenOverlay}><Feather name="lock" size={32} color="#FFF" /></View>}
           </LinearGradient>

           <View style={webCardStyles.featuresGrid}>
              <Text style={[webCardStyles.gridTitle, { color: T.text }]}>Premium Features</Text>
              <View style={webCardStyles.gridRow}>
                 {[
                   { title: 'Apple Pay Integration', desc: 'Active & Verified', icon: 'smartphone' },
                   { title: 'Zero FX Fees', desc: 'Global access at interbank rates', icon: 'globe' },
                   { title: 'Premium Insurance', desc: 'Coverage up to $5M USD', icon: 'shield' },
                 ].map((f, i) => (
                    <View key={i} style={[webCardStyles.featureCard, { backgroundColor: T.surface, borderColor: T.border + '20' }]}>
                       <Feather name={f.icon as any} size={20} color={T.primary} />
                       <Text style={[webCardStyles.featureTitle, { color: T.text }]}>{f.title}</Text>
                       <Text style={[webCardStyles.featureDesc, { color: T.textMuted }]}>{f.desc}</Text>
                    </View>
                 ))}
              </View>
           </View>
        </View>

        <View style={webCardStyles.dataColumn}>
           <View style={[webCardStyles.usageCard, { backgroundColor: T.surface }]}>
              <Text style={[webCardStyles.usageTitle, { color: T.textMuted }]}>Monthly Limit Usage</Text>
              <Text style={[webCardStyles.usageValue, { color: T.text }]}>$248,500 / $1.0M</Text>
              <View style={webCardStyles.progressBarWrap}>
                 <View style={[webCardStyles.progressBar, { backgroundColor: T.primary, width: '25%' }]} />
              </View>
           </View>

           <View style={[webCardStyles.historyCard, { backgroundColor: T.surface }]}>
              <Text style={[webCardStyles.historyTitle, { color: T.text }]}>Card Spending History</Text>
              <View style={webCardStyles.historyList}>
                 {[
                   { title: 'Apple Store, Fifth Ave', sub: 'Technology & Gadgets', amount: '-$12,450.00' },
                   { title: 'Emirates Airlines', sub: 'Travel & Business', amount: '-$8,200.00' },
                   { title: 'The Nomad Rooftop', sub: 'Entertainment', amount: '-$1,240.00' },
                   { title: 'Shell Energy', sub: 'Automotive', amount: '-$120.00' },
                 ].map((item, i) => (
                    <View key={i} style={[webCardStyles.historyItem, { borderBottomColor: T.border + '20' }]}>
                       <View style={{ flex: 1 }}>
                          <Text style={[webCardStyles.historyItemTitle, { color: T.text }]}>{item.title}</Text>
                          <Text style={[webCardStyles.historyItemSub, { color: T.textMuted }]}>{item.sub}</Text>
                       </View>
                       <Text style={[webCardStyles.historyItemAmount, { color: T.text }]}>{item.amount}</Text>
                    </View>
                 ))}
              </View>
           </View>
        </View>
      </View>
    </View>
  );
};

export default function CardScreen({ navigation }: any) {
  const {
    cardBalance, cardFrozen, toggleFreezeCard,
    balances, ethBalance, topupCard, spendCard,
    transactions, isDarkMode, prices, walletAddress,
  } = useWallet();

  const T = isDarkMode ? Theme.colors : Theme.lightColors;

  const [showTopup, setShowTopup]     = useState(false);
  const [showSpend, setShowSpend]     = useState(false);
  const [topupCoin, setTopupCoin]     = useState('USDT');
  const [topupAmount, setTopupAmount] = useState('');
  const [customSpend, setCustomSpend] = useState('');
  const [topupLoading, setTopupLoading] = useState(false);
  const [spendLoading, setSpendLoading] = useState(false);
  const [toast, setToast]             = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') =>
    setToast({ visible: true, message, type });

  const availableBalance = topupCoin === 'ETH'
    ? parseFloat(ethBalance) || 0
    : balances[topupCoin] ?? 0;

  const coinPrice  = prices[topupCoin]?.usd ?? 1;
  const usdPreview = topupAmount ? parseFloat(topupAmount) * coinPrice : 0;

  const cardTxs = transactions
    .filter(t => t.type === 'card_topup' || t.type === 'card_spend')
    .slice(0, 5);

  const handleTopup = async () => {
    const amt = parseFloat(topupAmount);
    if (!amt || amt <= 0) {
      showToast('Enter a valid amount', 'error');
      return;
    }
    if (amt > availableBalance) {
      showToast(`Insufficient balance. You have ${availableBalance.toFixed(4)} ${topupCoin}`, 'error');
      return;
    }
    setTopupLoading(true);
    await new Promise(r => setTimeout(r, 600)); // simulate brief processing
    const success = topupCard(topupCoin, amt);
    setTopupLoading(false);
    if (success) {
      showToast(`$${usdPreview.toFixed(2)} added to your card!`, 'success');
      setTopupAmount('');
      setShowTopup(false);
    } else {
      showToast('Top-up failed. Please try again.', 'error');
    }
  };

  const handleSpend = async (amount: number, label: string) => {
    if (cardFrozen) {
      showToast('Card is frozen. Unfreeze it first.', 'error');
      return;
    }
    if (cardBalance < amount) {
      showToast(`Insufficient card balance ($${cardBalance.toFixed(2)})`, 'error');
      return;
    }
    setSpendLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const success = spendCard(amount, label);
    setSpendLoading(false);
    if (success) {
      showToast(`$${amount} paid for ${label}`, 'success');
    } else {
      showToast('Payment failed. Please try again.', 'error');
    }
  };

  const styles = makeStyles(T);

  if (Platform.OS === 'web') {
    return <WebCardManagement cardBalance={cardBalance} cardFrozen={cardFrozen} T={T} walletAddress={walletAddress} />;
  }

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(p => ({ ...p, visible: false }))}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color={T.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Virtual Card</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Profile')} activeOpacity={0.7}>
          <Feather name="more-vertical" size={24} color={T.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Card Visual */}
        <TouchableOpacity activeOpacity={0.9} style={[styles.cardWrap, cardFrozen && styles.cardFrozen]}>
          <LinearGradient
            colors={['#191C1E', '#343A40']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.cardBrandSub}>CRYPTOWALLET</Text>
                <Text style={styles.cardBrand}>Virtual Card</Text>
              </View>
              <Feather name="wifi" size={24} color="rgba(255,255,255,0.7)" style={{ transform: [{ rotate: '90deg' }] }} />
            </View>
            <Text style={styles.cardNumber}>• • • •   • • • •   • • • •   • • • •</Text>
            <View style={styles.cardBottom}>
              <View style={styles.cardField}>
                <Text style={styles.cardFieldLabel}>CARD HOLDER</Text>
                <Text style={styles.cardFieldValue} numberOfLines={1}>{walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '—'}</Text>
              </View>
              <View style={[styles.simBadge]}>
                <Text style={styles.simBadgeText}>SIMULATION</Text>
              </View>
            </View>
            {cardFrozen && (
              <View style={styles.frozenOverlay}>
                <Feather name="lock" size={28} color="#FFF" style={{ marginBottom: 6 }} />
                <Text style={styles.frozenText}>FROZEN</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Balance Row */}
        <View style={styles.balRow}>
          <View>
            <Text style={[styles.balLabel, { color: T.textMuted }]}>Card Balance</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 18, color: T.text, marginTop: 4, marginRight: 2, fontWeight: '700' }}>$</Text>
              <Text style={[styles.balValue, { color: T.text }]}>{cardBalance.toFixed(2)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: T.primary }]}
            onPress={() => setShowTopup(!showTopup)}
            activeOpacity={0.7}
          >
            <Feather name="plus-circle" size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.addBtnText}>Add Funds</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={toggleFreezeCard} activeOpacity={0.7}>
            <View style={[styles.actionIconBox, { backgroundColor: T.background }, cardFrozen && { backgroundColor: '#FFEDD5' }]}>
              <Feather name={cardFrozen ? 'unlock' : 'lock'} size={18} color={cardFrozen ? '#EA580C' : T.text} />
            </View>
            <Text style={[styles.actionLabel, { color: T.text }]}>{cardFrozen ? 'Unfreeze' : 'Freeze'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowSpend(!showSpend)} activeOpacity={0.7}>
            <View style={[styles.actionIconBox, { backgroundColor: T.background }]}>
              <Feather name="shopping-bag" size={18} color={T.text} />
            </View>
            <Text style={[styles.actionLabel, { color: T.text }]}>Spend</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('History')} activeOpacity={0.7}>
            <View style={[styles.actionIconBox, { backgroundColor: T.background }]}>
              <Feather name="file-text" size={18} color={T.text} />
            </View>
            <Text style={[styles.actionLabel, { color: T.text }]}>Statement</Text>
          </TouchableOpacity>
        </View>

        {/* Top-up Panel */}
        {showTopup && (
          <View style={[styles.panel, { backgroundColor: T.surface }]}>
            <View style={styles.panelHeader}>
              <Text style={[styles.panelTitle, { color: T.text }]}>Top-up Card</Text>
              <TouchableOpacity onPress={() => { setShowTopup(false); setTopupAmount(''); }} style={{ padding: 4 }}>
                <Feather name="x" size={20} color={T.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.panelSub, { color: T.textMuted }]}>Select coin and amount to convert</Text>

            <View style={styles.coinRow}>
              {COINS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.coinChip, { backgroundColor: T.background, borderColor: T.border }, topupCoin === c && { backgroundColor: T.primary, borderColor: T.primary }]}
                  onPress={() => { setTopupCoin(c); setTopupAmount(''); }}
                >
                  <Text style={[styles.coinChipText, { color: T.textMuted }, topupCoin === c && { color: '#FFF' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.inputWrap, { backgroundColor: T.background, borderColor: T.border }]}>
              <Text style={[styles.hintLeft, { color: T.textMuted }]}>Send: {topupCoin}</Text>
              <Text style={[styles.hintRight, { color: T.textMuted }]}>Avail: {availableBalance.toFixed(4)}</Text>
              <TextInput
                style={[styles.input, { color: T.text }]}
                placeholder="0.00"
                placeholderTextColor={T.textDim}
                value={topupAmount}
                onChangeText={setTopupAmount}
                keyboardType="decimal-pad"
              />
              {!!topupAmount && (
                <Text style={[styles.usdPreview, { color: T.primary }]}>≈ ${usdPreview.toFixed(2)} USD</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: T.primary, opacity: topupLoading ? 0.7 : 1 }]}
              onPress={handleTopup}
              disabled={topupLoading}
              activeOpacity={0.8}
            >
              {topupLoading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator color="#FFF" size="small" />
                  <Text style={styles.primaryBtnText}>Processing...</Text>
                </View>
              ) : (
                <Text style={styles.primaryBtnText}>Confirm Top-up</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Spend Panel */}
        {showSpend && (
          <View style={[styles.panel, { backgroundColor: T.surface }]}>
            <View style={styles.panelHeader}>
              <Text style={[styles.panelTitle, { color: T.text }]}>Simulate Payment</Text>
              <TouchableOpacity onPress={() => { setShowSpend(false); setCustomSpend(''); }} style={{ padding: 4 }}>
                <Feather name="x" size={20} color={T.textMuted} />
              </TouchableOpacity>
            </View>

            {cardFrozen && (
              <View style={[styles.frozenBanner, { backgroundColor: '#FFEDD5' }]}>
                <Feather name="lock" size={14} color="#EA580C" />
                <Text style={{ color: '#EA580C', fontSize: 13, fontWeight: '600' }}>
                  Card is frozen. Unfreeze to make payments.
                </Text>
              </View>
            )}

            <View style={styles.spendGrid}>
              {SPEND_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s.label}
                  style={[styles.spendCard, { backgroundColor: T.background, borderColor: T.border }]}
                  onPress={() => handleSpend(s.amount, s.label)}
                  disabled={spendLoading || cardFrozen}
                  activeOpacity={0.7}
                >
                  <Feather name={s.icon as any} size={20} color={T.primary} style={{ marginBottom: 8 }} />
                  <Text style={[styles.spendLabel, { color: T.textMuted }]}>{s.label}</Text>
                  <Text style={[styles.spendAmount, { color: T.text }]}>${s.amount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customRow}>
              <TextInput
                style={[styles.customInput, { backgroundColor: T.background, color: T.text, borderColor: T.border }]}
                placeholder="Custom USD amount"
                placeholderTextColor={T.textDim}
                value={customSpend}
                onChangeText={setCustomSpend}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                style={[styles.payBtn, { backgroundColor: T.primary }]}
                onPress={() => {
                  const amt = parseFloat(customSpend || '0');
                  if (amt > 0) { handleSpend(amt, 'Custom Payment'); setCustomSpend(''); }
                  else showToast('Enter a valid amount', 'error');
                }}
                disabled={spendLoading || cardFrozen}
              >
                {spendLoading
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Text style={styles.payBtnText}>Pay</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: T.text }]}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')} activeOpacity={0.7}>
            <Text style={[styles.seeAll, { color: T.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.txList, { backgroundColor: T.surface }]}>
          {cardTxs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="inbox" size={32} color={T.border} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: T.text }]}>No card transactions yet</Text>
              <Text style={[styles.emptySub, { color: T.textMuted }]}>Top up your card to start spending</Text>
            </View>
          ) : (
            cardTxs.map((tx, idx) => (
              <View key={tx.id} style={[styles.txRow, idx < cardTxs.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.border }]}>
                <View style={[styles.txIconBox, { backgroundColor: tx.type === 'card_topup' ? '#E8F0FE' : '#FFFBEB' }]}>
                  <Feather
                    name={tx.type === 'card_topup' ? 'arrow-down-left' : 'shopping-cart'}
                    size={18}
                    color={tx.type === 'card_topup' ? T.primary : '#D97706'}
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={[styles.txTitle, { color: T.text }]}>{tx.type === 'card_topup' ? 'Top-up' : 'Spent'}</Text>
                  <Text style={[styles.txMeta, { color: T.textMuted }]}>{tx.address} · {tx.date}</Text>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === 'card_topup' ? T.success : T.error }]}>
                  {tx.type === 'card_topup' ? '+' : '-'}${parseFloat(tx.usdValue || '0').toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const makeStyles = (T: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: T.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 24 : 60, paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: T.text },
  scroll: { paddingHorizontal: 24, paddingBottom: 60 },

  cardWrap: { marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
  card: { borderRadius: 24, padding: 28, height: 210, justifyContent: 'space-between' },
  cardFrozen: { opacity: 0.75 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardBrandSub: { color: 'rgba(255,255,255,0.65)', fontSize: 10, letterSpacing: 2, fontWeight: '700', marginBottom: 2 },
  cardBrand: { color: '#FFF', fontSize: 20, fontWeight: '800', fontStyle: 'italic', letterSpacing: -0.5 },
  cardNumber: { color: '#FFF', fontSize: 18, letterSpacing: 4, fontWeight: '600', fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
  cardBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  cardField: { marginRight: 24 },
  cardFieldLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginBottom: 4 },
  cardFieldValue: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  cardType: { color: '#FFF', fontSize: 18, fontWeight: '800', fontStyle: 'italic' },
  simBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  simBadgeText: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  frozenOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  frozenText: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 3 },

  balRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  balLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  balValue: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginBottom: 4 },
  addBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  actionBtn: { flex: 1, backgroundColor: T.surface, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  actionIconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: '700' },

  panel: { borderRadius: 20, padding: 20, marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  panelTitle: { fontSize: 16, fontWeight: '700' },
  panelSub: { fontSize: 12, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 0.5 },

  frozenBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginBottom: 16 },

  coinRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  coinChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  coinChipText: { fontWeight: '600', fontSize: 13 },

  inputWrap: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 20, position: 'relative' },
  hintLeft: { position: 'absolute', top: 16, left: 16, fontSize: 12, fontWeight: '600' },
  hintRight: { position: 'absolute', top: 16, right: 16, fontSize: 12 },
  input: { marginTop: 24, fontSize: 32, fontWeight: '700' },
  usdPreview: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  primaryBtn: { borderRadius: 16, padding: 18, alignItems: 'center' },
  primaryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  spendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  spendCard: { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1 },
  spendLabel: { fontSize: 13, marginBottom: 4, fontWeight: '600' },
  spendAmount: { fontSize: 20, fontWeight: '800' },
  customRow: { flexDirection: 'row', gap: 12 },
  customInput: { flex: 1, borderRadius: 16, padding: 16, fontSize: 15, borderWidth: 1, fontWeight: '600' },
  payBtn: { borderRadius: 16, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  payBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  seeAll: { fontSize: 14, fontWeight: '600' },

  txList: { borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  txIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1, marginLeft: 16 },
  txTitle: { fontWeight: '600', fontSize: 15, marginBottom: 2 },
  txMeta: { fontSize: 12 },
  txAmount: { fontSize: 16, fontWeight: '700' },

  emptyCard: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  emptySub: { fontSize: 13 },
});

const webCardStyles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1, marginBottom: 8 },
  sub: { fontSize: 16, fontWeight: '500', marginBottom: 48, maxWidth: 640, lineHeight: 24 },
  mainRow: { flexDirection: 'row', gap: 48 },
  cardColumn: { flex: 1.5 },
  obsidianCard: {
    borderRadius: 32,
    padding: 40,
    height: 320,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    marginBottom: 48,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardClient: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  cardBrand: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  cardMid: { alignItems: 'center' },
  cardNumber: { color: '#FFF', fontSize: 28, letterSpacing: 8, fontWeight: '600', fontFamily: 'monospace' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardExpLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
  cardExpValue: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  chipSim: { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  chipSimText: { color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  frozenOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 32, alignItems: 'center', justifyContent: 'center' },

  featuresGrid: { flex: 1 },
  gridTitle: { fontSize: 18, fontWeight: '800', marginBottom: 24 },
  gridRow: { flexDirection: 'row', gap: 16 },
  featureCard: { flex: 1, borderRadius: 24, padding: 24, borderWidth: 1, gap: 16 },
  featureTitle: { fontSize: 16, fontWeight: '700' },
  featureDesc: { fontSize: 13, fontWeight: '500', lineHeight: 18 },

  dataColumn: { flex: 1, gap: 32 },
  usageCard: { borderRadius: 32, padding: 32, gap: 16 },
  usageTitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  usageValue: { fontSize: 24, fontWeight: '800' },
  progressBarWrap: { height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 4 },

  historyCard: { borderRadius: 32, padding: 32 },
  historyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 24 },
  historyList: { gap: 4 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, gap: 16 },
  historyItemTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  historyItemSub: { fontSize: 12, fontWeight: '600' },
  historyItemAmount: { fontSize: 16, fontWeight: '800' },
});

