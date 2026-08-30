import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MapPin,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Conversation, Message, Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeConversationId?: number | null;
  targetListing?: Listing | null;
  onOpenListing?: (listingId: number) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  activeConversationId,
  targetListing,
  onOpenListing,
}) => {
  const { user, activeCampus } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<number | null>(activeConversationId || null);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMeetupPicker, setShowMeetupPicker] = useState(false);
  const [customOfferAmount, setCustomOfferAmount] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load all user conversations
  const loadConversations = async () => {
    try {
      const list = await api.conversations.getAll();
      setConversations(list);
      if (!currentConvId && list.length > 0 && !targetListing) {
        setCurrentConvId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  // If targetListing was provided, start/get conversation
  useEffect(() => {
    if (isOpen && targetListing && user) {
      const initChat = async () => {
        try {
          const res = await api.conversations.start(targetListing.id);
          setCurrentConvId(res.conversation.id);
          setCurrentConversation(res.conversation);
          setMessages(res.messages);
        } catch (err) {
          console.error('Failed to initiate conversation:', err);
        }
      };
      initChat();
    }
  }, [isOpen, targetListing, user]);

  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
    }
  }, [isOpen, user]);

  // Load messages for current conversation
  useEffect(() => {
    if (!currentConvId) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await api.conversations.getMessages(currentConvId);
        setCurrentConversation(res.conversation);
        setMessages(res.messages);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [currentConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (
    textToSend?: string,
    messageType: 'text' | 'offer' | 'meetup_proposal' = 'text',
    metadata?: any
  ) => {
    const text = textToSend || inputText.trim();
    if (!text || !currentConvId) return;

    setSending(true);
    try {
      const newMsg = await api.conversations.sendMessage(currentConvId, text, messageType, metadata);
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      setShowMeetupPicker(false);
      setShowOfferModal(false);
      loadConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleProposeSpot = (spotName: string) => {
    handleSendMessage(
      `Let's meet up at ${spotName} (Monitored Campus Safe Zone). What time works best for you?`,
      'meetup_proposal',
      { location: spotName }
    );
  };

  const handleSendCustomOffer = () => {
    if (!customOfferAmount || Number(customOfferAmount) <= 0) return;
    handleSendMessage(
      `I'd like to make an offer of $${customOfferAmount} for this item.`,
      'offer',
      { offerAmount: Number(customOfferAmount) }
    );
  };

  // Determine other participant
  const otherParticipant =
    currentConversation?.buyerId === user?.id
      ? currentConversation?.seller
      : currentConversation?.buyer;

  const listingContext = currentConversation?.listing || targetListing;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] shadow-2xl flex overflow-hidden border border-slate-200">
        
        {/* Left: Conversations Sidebar */}
        <div className="w-80 border-r border-slate-200 hidden md:flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Campus Inquiries</h3>
            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {conversations.length} Active
            </span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No active conversations yet. Click "Message Seller" on any listing!
              </div>
            ) : (
              conversations.map((conv) => {
                const other = conv.buyerId === user?.id ? conv.seller : conv.buyer;
                const isSelected = currentConvId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setCurrentConvId(conv.id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition ${
                      isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <img
                      src={other?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {other?.name || 'Student'}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-medium text-emerald-800 truncate mt-0.5">
                        {conv.listing?.title || 'Campus Item'}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {conv.lastMessageText || 'Chat started'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          
          {/* Chat Header */}
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/40">
            <div className="flex items-center gap-3">
              {otherParticipant && (
                <>
                  <img
                    src={otherParticipant.avatar}
                    alt=""
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900">{otherParticipant.name}</span>
                      {otherParticipant.studentIdVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Verified .edu" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{otherParticipant.university}</p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contextual Listing Bar */}
          {listingContext && (
            <div
              onClick={() => onOpenListing && onOpenListing(listingContext.id)}
              className="px-5 py-2.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={listingContext.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=150'}
                  alt=""
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-emerald-200"
                />
                <div>
                  <span className="font-bold text-xs text-emerald-950 truncate max-w-xs block">
                    {listingContext.title}
                  </span>
                  <span className="text-[11px] font-extrabold text-emerald-700">
                    ${listingContext.price}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1">
                View Item <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/30">
            {loading ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Send your first message to coordinate a campus meetup!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      {/* Special formatting for meetup proposals */}
                      {msg.messageType === 'meetup_proposal' && (
                        <div className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Campus Safe Meetup Proposal</span>
                        </div>
                      )}

                      {/* Special formatting for offers */}
                      {msg.messageType === 'offer' && (
                        <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Price Offer</span>
                        </div>
                      )}

                      <div>{msg.text}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Action Quick Chips */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setShowMeetupPicker(!showMeetupPicker)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 shrink-0 transition"
            >
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>Propose Safe Spot</span>
            </button>

            <button
              onClick={() => setShowOfferModal(!showOfferModal)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 shrink-0 transition"
            >
              <DollarSign className="w-3 h-3 text-amber-500" />
              <span>Make Price Offer</span>
            </button>

            <button
              onClick={() => handleSendMessage('Is this item still available for pickup today on campus?')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 shrink-0 transition"
            >
              "Still available today?"
            </button>
          </div>

          {/* Safe Pickup Spot Picker Drawer */}
          {showMeetupPicker && activeCampus && (
            <div className="p-3 bg-emerald-50 border-t border-emerald-100 flex flex-wrap items-center gap-2 animate-in fade-in">
              <span className="text-xs font-bold text-emerald-950">Select Campus Safe Spot:</span>
              {activeCampus.safePickupZones.map((spot) => (
                <button
                  key={spot.name}
                  onClick={() => handleProposeSpot(spot.name)}
                  className="px-2.5 py-1 rounded-lg bg-white text-emerald-900 border border-emerald-200 text-xs font-medium hover:bg-emerald-600 hover:text-white transition"
                >
                  {spot.name}
                </button>
              ))}
            </div>
          )}

          {/* Offer Input Drawer */}
          {showOfferModal && (
            <div className="p-3 bg-amber-50 border-t border-amber-200 flex items-center gap-2 animate-in fade-in">
              <span className="text-xs font-bold text-amber-950">Offer Amount ($):</span>
              <input
                type="number"
                min="1"
                value={customOfferAmount}
                onChange={(e) => setCustomOfferAmount(e.target.value)}
                placeholder="e.g. 50"
                className="w-24 px-2.5 py-1 text-xs bg-white border border-amber-300 rounded-lg outline-hidden"
              />
              <button
                onClick={handleSendCustomOffer}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition"
              >
                Send Offer
              </button>
              <button
                onClick={() => setShowOfferModal(false)}
                className="px-2 py-1 text-slate-500 text-xs hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message or propose meetup..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-100 rounded-2xl border border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-hidden transition"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
